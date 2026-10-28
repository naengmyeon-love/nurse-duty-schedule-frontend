import { CalendarClock } from "lucide-react";
import { FairnessTable } from "@/components/fairness-table";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { ReadonlyScheduleTable } from "@/components/schedule-table";
import { ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { currentMonth, monthLabel } from "@/lib/date";
import { countShifts } from "@/lib/statistics";
import { getView } from "@/lib/backend";
import type { NurseScheduleView } from "@/lib/domain";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "확정 듀티표" };

export default async function NurseSchedulePage({ searchParams }: { searchParams: Promise<{ month?: string; error?: string; message?: string }> }) {
  const user = await requireUser("NURSE"); const query = await searchParams; const requestedMonth = query.month; const month = requestedMonth && isValidMonth(requestedMonth) ? requestedMonth : currentMonth();
  const { schedule, nurses, fairness, fairnessHistory: history, originalRequests } = await getView<NurseScheduleView>("nurse-schedule", { month });
  const originalOutcomes = new Map(originalRequests.map((r) => [`${r.userId}:${r.date}`, r.outcome]));
  const outcomeLabels: Record<string, string> = { HONORED: "반영", MISSED: "미반영", PENDING: "미배정" };
  const requestLabels: Record<string, string> = { REQUESTED: "대기", APPROVED: "승인", REJECTED: "반려" };
  const mine = schedule?.entries.filter((entry) => entry.userId === user.id) ?? []; const counts = countShifts(mine.map((entry) => entry.shift));
  return <><PageHeader
    eyebrow="CONFIRMED SCHEDULE"
    title={`${monthLabel(month)} 확정 듀티표`}
    description="수간호사가 최종 확정한 병동 전체 근무표입니다."
    action={<MonthPicker month={month} path="/nurse/schedule" />}
  />
    {query.error && <p className="alert error" role="alert">{query.message || "필수 조건과 충돌하여 변경을 저장하지 않았습니다."}</p>}
    {!schedule ? <section className="card empty-large"><span className="empty-icon"><CalendarClock/></span><h2>아직 공개된 근무표가 없습니다.</h2><p>작성 중인 임시 근무표는 확정 전까지 보이지 않습니다.</p></section> : <><section className="schedule-toolbar card"><div className="schedule-state"><span>공개 상태</span><ScheduleBadge status={schedule.status}/></div><a className="button secondary" href={`/api/schedule-export?month=${month}`}>월간 엑셀 다운로드</a><div className="my-inline-stats"><strong>내 근무</strong><span>D {counts.D}</span><span>E {counts.E}</span><span>N {counts.N}</span><span>OFF {counts.O}</span></div></section><section className="card schedule-card"><div className="schedule-legend"><span><i className="shift shift-D">D</i> Day</span><span><i className="shift shift-E">E</i> Evening</span><span><i className="shift shift-N">N</i> Night</span><span><i className="shift shift-O">O</i> Off</span></div><ReadonlyScheduleTable month={month} nurses={nurses} entries={schedule.entries} highlightUserId={user.id}/></section>{fairness && <FairnessTable metrics={fairness.metrics.filter((m) => m.userId === user.id)} history={history.filter((h) => h.userId === user.id)} ownOnly/>}</>}
    {schedule && fairness && <section className="card table-card"><div className="card-header"><div><h2>내 희망 OFF 신청 결과 보존</h2><p>최초 확정 당시 신청과 결과를 보존하며, 교환 이후의 현재 결과를 함께 확인합니다.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>신청 날짜</th><th>{originalRequests.length ? "최초 확정 당시 승인 상태" : "현존 신청 승인 상태"}</th><th>최초 확정 결과</th><th>현재 결과</th></tr></thead><tbody>{fairness.requests.filter((r) => r.userId === user.id).map((r) => <tr key={r.date}><td>{r.date}</td><td>{requestLabels[r.status] ?? r.status}</td><td>{outcomeLabels[originalOutcomes.get(`${r.userId}:${r.date}`) ?? ""] ?? "기록 없음"}</td><td>{outcomeLabels[r.outcome]}</td></tr>)}{!fairness.requests.some((r) => r.userId === user.id) && <tr><td colSpan={4}>이 달 보존된 신청이 없습니다.</td></tr>}</tbody></table></div></section>}
  </>;
}
