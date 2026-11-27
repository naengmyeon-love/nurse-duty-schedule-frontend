import test from "node:test";
import assert from "node:assert/strict";
import { currentMonth } from "../../lib/date";
import type { HeadScheduleView, NurseScheduleView } from "../../lib/domain";

const frontend = process.env.DUTYMATE_FRONTEND_TEST_URL ?? "http://invalid";
const backend = process.env.DUTYMATE_BACKEND_TEST_URL ?? "http://invalid";
if (process.env.DUTYMATE_INTEGRATION !== "1" || [frontend, backend].some((value) => new URL(value).hostname !== "127.0.0.1")) throw new Error("Run only with the isolated backend integration runner --frontend.");
const secret = process.env.FRONTEND_SHARED_SECRET!;
async function login(name: string, employeeNumber: string) {
  const response = await fetch(`${backend}/api/v1/auth/login`, { method: "POST", headers: { "x-frontend-shared-secret": secret, "Content-Type": "application/json" }, body: JSON.stringify({ name, employeeNumber }) });
  assert.equal(response.status, 200);
  return (await response.json()).token as string;
}
const cookie = (token: string) => ({ Cookie: `nurse_duty_session=${token}`, "x-frontend-shared-secret": "caller-cannot-override-the-server-secret" });

test("실제 프런트 다운로드는 DB설정 없이 세션을 backend로 전달하고 비로그인·월·확정 권한을 검사한다", async () => {
  const nurse = await login("김민지", "N001");
  const head = await login("관리자", "H001");
  assert.equal((await fetch(`${frontend}/api/schedule-export?month=${currentMonth()}`)).status, 401);
  assert.equal((await fetch(`${frontend}/api/schedule-export?month=2030-13`, { headers: cookie(nurse) })).status, 400);
  const next = new Date(`${currentMonth()}-01T00:00:00Z`); next.setUTCMonth(next.getUTCMonth() + 1);
  const nextMonth = next.toISOString().slice(0, 7);
  assert.equal((await fetch(`${frontend}/api/schedule-export?month=${nextMonth}`, { headers: cookie(nurse) })).status, 404);
  assert.equal((await fetch(`${frontend}/api/schedule-export?month=${nextMonth}`, { headers: cookie(head) })).status, 200);
  const response = await fetch(`${frontend}/api/schedule-export?month=${currentMonth()}&wardId=99999`, { headers: cookie(nurse) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.match(response.headers.get("Content-Type")!, /spreadsheetml/);
  assert.equal(response.headers.get("Content-Disposition"), `attachment; filename="dutymate-${currentMonth()}.xlsx"`);
  for (const header of ["Set-Cookie", "x-frontend-shared-secret", "x-vercel-id"]) assert.equal(response.headers.has(header), false);
  const data = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...data.slice(0, 4)], [80, 75, 3, 4]);
});

test("실제 프런트 편집 proxy는 간호사 역할을 차단하고 backend의 필수위반 409·상세이유를 유지한다", async () => {
  const head = await login("HTTP 관리자", "HTTP-H001");
  const nurse = await login("HTTP 간호사", "HTTP-N001");
  const response = await fetch(`${backend}/api/v1/view?name=head-schedule&month=2030-05`, { headers: { Cookie: `nurse_duty_session=${head}`, "x-frontend-shared-secret": secret } });
  const { data } = await response.json() as { data: HeadScheduleView };
  assert.ok(data.schedule);
  assert.ok(data.validation);
  assert.equal(data.fairness.metrics.length, 2);
  assert.ok(data.generationReport);
  const nurseView = await fetch(`${backend}/api/v1/view?name=nurse-schedule&month=2030-05`, { headers: { Cookie: `nurse_duty_session=${nurse}`, "x-frontend-shared-secret": secret } });
  const { data: individual } = await nurseView.json() as { data: NurseScheduleView };
  const mine = individual.fairness!.metrics[0];
  assert.equal(individual.fairness!.metrics.length, 1);
  const payload = { scheduleId: data.schedule.id, userId: mine.userId, date: "2030-05-05", shift: "D", force: true };
  const denied = await fetch(`${frontend}/api/schedule-entry`, { method: "POST", headers: { ...cookie(nurse), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  assert.equal(denied.status, 403);
  const conflict = await fetch(`${frontend}/api/schedule-entry`, { method: "POST", headers: { ...cookie(head), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  assert.equal(conflict.status, 409);
  const issue = await conflict.json() as { error: string; issues: string[] };
  assert.match(issue.error, /승인/);
  assert.ok(issue.issues.length > 0);
});

test("수간호사 화면이 확정 근무와 모형·직접 선택 결과를 렌더링한다", async () => {
  const head = await login("HTTP 관리자", "HTTP-H001");
  const get = async (path: string) => {
    const response = await fetch(frontend + path, { headers: cookie(head) });
    assert.equal(response.status, 200);
    return response.text();
  };
  assert.match(await get("/head/emergency?date=2030-05-10"), /미충원 보고 이력/);
  const blind = await get("/head/emergency/trial?seed=5");
  assert.match(blind, /당일 OFF 명단/);
  assert.doesNotMatch(blind, /같은 결원에 대한 결과/);
  const compared = await get("/head/emergency/trial?seed=5&choice=none");
  assert.match(compared, /같은 결원에 대한 결과/);
  assert.match(compared, /명단순 첫 적격자/);
  assert.match(compared, /미해결/);
  assert.match(compared, /개인 최대 주말 초과/);
  assert.match(compared, /고정 순환표/);
});
