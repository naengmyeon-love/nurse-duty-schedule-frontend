import assert from "node:assert/strict";
import test from "node:test";
import { scheduleExportResponse, XLSX_CONTENT_TYPE } from "../lib/schedule-export";

test("월간 다운로드 프록시는 workbook bytes와 파일 형식을 보존하고 업스트림 비밀 헤더를 제거한다", async () => {
  const bytes = new Uint8Array([80, 75, 3, 4, 0, 255, 17]);
  const result = await scheduleExportResponse(new Response(bytes, { headers: {
    "Content-Type": `${XLSX_CONTENT_TYPE}; charset=binary`,
    "Content-Disposition": "attachment; filename=upstream-internal.xlsx",
    "Set-Cookie": "sensitive_session=never-forward",
    "x-frontend-shared-secret": "never-forward",
    "x-vercel-id": "internal-instance",
    "Access-Control-Allow-Origin": "https://internal.example",
    Server: "internal-server",
  } }), "2026-10");
  assert.equal(result.status, 200);
  assert.deepEqual(new Uint8Array(await result.arrayBuffer()), bytes);
  assert.equal(result.headers.get("Content-Type"), XLSX_CONTENT_TYPE);
  assert.equal(result.headers.get("Content-Disposition"), 'attachment; filename="dutymate-2026-10.xlsx"');
  assert.equal(result.headers.get("Cache-Control"), "private, no-store");
  assert.equal(result.headers.get("X-Content-Type-Options"), "nosniff");
  for (const header of ["Set-Cookie", "x-frontend-shared-secret", "x-vercel-id", "Access-Control-Allow-Origin", "Server"]) assert.equal(result.headers.has(header), false);
});

test("조회 권한 오류 401/403/404는 유지하되 업스트림 상세 메시지는 노출하지 않는다", async () => {
  for (const status of [401, 403, 404]) {
    const result = await scheduleExportResponse(Response.json({ error: "PRIVATE_DATABASE_DIAGNOSTIC" }, { status }), "2026-10");
    assert.equal(result.status, status);
    assert.equal((await result.text()).includes("PRIVATE_DATABASE_DIAGNOSTIC"), false);
    assert.equal(result.headers.get("Cache-Control"), "private, no-store");
  }
});

test("서버 실패·리다이렉트와 가짜 workbook 응답은 일반적인 502 오류로 바꾼다", async () => {
  for (const status of [302, 400, 409, 429, 500, 503]) {
    const result = await scheduleExportResponse(new Response("PRIVATE_ERROR", { status }), "2026-10");
    assert.equal(result.status, 502);
    assert.equal((await result.text()).includes("PRIVATE_ERROR"), false);
  }
  for (const contentType of ["text/html", "application/json", "text/csv", ""]) {
    const result = await scheduleExportResponse(new Response("<h1>Internal server error</h1>", { headers: { "Content-Type": contentType } }), "2026-10");
    assert.equal(result.status, 502);
    assert.equal(result.headers.get("Content-Disposition"), null);
  }
});

test("다운로드 파일명에 들어가는 월은 유효 범위와 형식을 검사한다", async () => {
  for (const month of ["", "2026-1", "2026-13", "2019-12", "2101-01", "2026-10\r\nSet-Cookie:x", "../../secrets"]) {
    const result = await scheduleExportResponse(new Response("PRIVATE_BODY", { headers: { "Content-Type": XLSX_CONTENT_TYPE } }), month);
    assert.equal(result.status, 400);
    assert.equal(result.headers.get("Content-Disposition"), null);
    assert.equal((await result.text()).includes("PRIVATE_BODY"), false);
  }
});
