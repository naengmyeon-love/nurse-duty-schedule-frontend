import { AlertTriangle, CheckCircle2, History, Settings2 } from "lucide-react";
import { applyScheduleProposalAction, discardScheduleProposalAction, ensureScheduleAction, setScheduleStatusAction } from "@/app/actions";
import { AutoGenerateButton } from "@/components/auto-generate-button";
import { FairnessTable } from "@/components/fairness-table";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { RequirementCalendar } from "@/components/requirement-calendar";
import { ScheduleEditor } from "@/components/schedule-editor";
import { ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { currentMonth, dayLabel, monthLabel } from "@/lib/date";
import { getView } from "@/lib/backend";
import type { HeadScheduleView } from "@/lib/domain";
import { scheduleStatusLabel } from "@/lib/labels";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "듀티표 관리" };
const changeLabels: Record<string, string> = { STATUS_CHANGED: "상태 변경", SHIFT_EDITED: "근무 수정", AUTO_GENERATED: "자동 생성", PROPOSAL_CREATED: "재생성안 생성", PROPOSAL_APPLIED: "재생성안 적용", REQUIREMENTS_CHANGED: "필요 인원 변경", SHIFT_CHANGE_APPROVED: "근무 교환·대체 승인", SEEDED: "체험 데이터 생성", CONFIRMED_AUTO_GENERATED: "확정표 자동 수정", CONFIRMED_SCHEDULE_EDITED: "확정표 수정" };
const errors: Record<string, string> = {
  "missing-data": "활성 간호사 또는 날짜별 필요 인원 데이터가 없습니다.",
  "not-found": "근무표를 찾을 수 없습니다.",
  constraints: "필수 조건과 충돌하여 저장하지 않았습니다. 아래 검사 결과를 확인해 주세요.",
  incomplete: "필수 위반·미배정·인원 부족을 해결한 뒤 확정해 주세요.",
  stale: "원본이나 규칙이 변경되었습니다. 최신 조건으로 다시 생성·검토해 주세요.",
};

export default async function HeadSchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser("HEAD_NURSE");
  const query = await searchParams;
  const month = query.month && isValidMonth(query.month) ? query.month : currentMonth();
  const { schedule, nurses, allNurses, offRequests, validation, shortageCandidates, fairness, fairnessHistory: history, vacationDates, proposalChanges, generationReport: report, proposal } = await getView<HeadScheduleView>("head-schedule", { month });
  if (!schedule) return <><PageHeader eyebrow="SCHEDULE" title="듀티표 관리" description="월별 근무표를 만들고 확정하세요." action={<MonthPicker month={month} path="/head/schedule" />} />{query.error && <div className="alert error" role="alert">{query.message || errors[query.error] || "변경을 저장하지 못했습니다."}</div>}<section className="card empty-large"><span className="empty-icon"><Settings2 /></span><h2>{monthLabel(month)} 근무표가 아직 없습니다.</h2><p>날짜별 필요 인원을 설정하고 배정을 시작할 수 있습니다.</p><form action={ensureScheduleAction}><input type="hidden" name="month" value={month}/><button className="button primary large">이 달 근무표 생성</button></form></section></>;
  if (!validation) return <p className="alert error" role="alert">근무표 검증 정보를 불러오지 못했습니다. 다시 시도해 주세요.</p>;
  const names = new Map(allNurses.map((n) => [n.id, n.name]));
  const requirements = schedule.requirements;
  const original = new Map(schedule.entries.map((entry) => [`${entry.userId}:${entry.date}`, entry.shift]));
  const shortageCount = validation.shortages.reduce((sum, shortage) => sum + shortage.shortage, 0);
  const currentReport = proposal?.report ?? report;
  return <>
    <PageHeader eyebrow="SCHEDULE" title={`${monthLabel(month)} 듀티표`} description="필수 조건을 지키며 작성하고, 전체 검사를 통과한 근무표를 확정하세요." action={<MonthPicker month={month} path="/head/schedule" />} />
    {query.generated && <div className="alert success"><CheckCircle2 size={18}/><span>{proposal ? "확정표를 유지하고 재생성안을 만들었습니다. 변경 내용을 검토해 주세요." : "자동 생성과 제한된 재배정을 마쳤습니다. 부족·미배정은 아래에서 확인하세요."}</span></div>}
    {query.error && <div className="alert error" role="alert"><AlertTriangle size={18}/><span>{query.message || errors[query.error] || query.error}</span></div>}
    <section className="schedule-toolbar card"><div className="schedule-state"><span>현재 상태</span><ScheduleBadge status={schedule.status}/></div><div className="schedule-toolbar-actions">
      <a className="button secondary" href={`/api/schedule-export?month=${month}`}>월간 엑셀 다운로드</a><AutoGenerateButton scheduleId={schedule.id} confirmed={schedule.status === "CONFIRMED"}/>
      <form className="status-actions" action={setScheduleStatusAction}><input type="hidden" name="scheduleId" value={schedule.id}/><button className="button secondary" name="status" value="REQUEST">신청 기간</button><button className="button secondary" name="status" value="DRAFT">작성 중</button><button className="button secondary" name="status" value="REVIEW">최종 검토</button><button className="button confirm" name="status" value="CONFIRMED"><CheckCircle2 size={17}/> 근무표 확정</button></form>
    </div></section>
    <details className="card"><summary>적용 규칙과 임시 기준</summary><p className="form-help">필수: 승인 휴가·OFF와 근무 중복 금지, 비활성 간호사 배정 금지, 개인별 월 Night·연속근무 한도, N 다음날 근무 금지, E→D 금지입니다. 미배정과 인원 부족은 작성 중에 남길 수 있으나 확정할 때 해결해야 합니다. 앞·뒤 달에 저장된 근무도 함께 검사합니다.</p><p className="form-help">기본 월 Night 6회·연속근무 6일·N 다음날 OFF는 프로토타입의 임시 기준입니다. 국내 교대제 시범사업의 과거 지표(연속 5일, 월 Night 7일 등)와 동일하지 않으며, 병원 내규나 법정 기준을 뜻하지 않습니다. 희망 OFF·가용 조건별 부담·경력 구성은 선호 조건입니다.</p></details>
    {schedule.status === "CONFIRMED" && <div className="alert warning"><AlertTriangle size={18}/><span>확정표를 직접 수정하면 전체 필수 조건을 검사한 뒤 간호사 화면에 즉시 반영합니다. 여러 셀을 조정하려면 최종 검토 상태로 전환하고 수정 후 재확정하세요. 자동 재생성은 검토안을 먼저 만듭니다.</span></div>}
    <section className="card"><div className="card-header"><div><h2>공통 조건 검사</h2><p>배정 위반 {validation.issues.length}건 · 미배정 {validation.unassigned.length}칸 · 필요 인원 부족 {shortageCount}명</p></div></div>
      {!!validation.issues.length && <div className="alert error"><ul>{validation.issues.map((issue) => <li key={issue.key}>{issue.message}</li>)}</ul></div>}
      {!validation.issues.length && <p className="constraint-ok"><CheckCircle2 size={16}/> 저장된 배정에서 필수 규칙 위반이 발견되지 않았습니다.</p>}
      {!!shortageCandidates.length && <details open><summary>부족한 날짜·근무조 ({shortageCandidates.length}곳)</summary>{shortageCandidates.map((s) => <details key={`${s.date}:${s.shift}`}><summary>{s.date} · {s.shift} · {s.shortage}명 부족 — 현재 후보 확인</summary><ul>{s.candidates.map((candidate) => <li key={candidate.userId}>{names.get(candidate.userId)}: {candidate.reasons.join(" · ")}</li>)}</ul></details>)}</details>}
      {!!validation.unassigned.length && <details><summary>미배정 {validation.unassigned.length}칸 — OFF와 구분</summary><ul>{validation.unassigned.map((u) => <li key={`${u.userId}:${u.date}`}>{names.get(u.userId)} · {u.date}</li>)}</ul></details>}
      {!!validation.unknownBoundaries.length && <details><summary>월 경계 미확인 {validation.unknownBoundaries.length}건</summary><p className="form-help">이웃 달 배정이 없는 날짜는 휴식 검증을 완료할 수 없습니다. 해당 월을 작성할 때 연결 조건을 다시 검사합니다.</p><ul>{validation.unknownBoundaries.map((b) => <li key={`${b.userId}:${b.date}`}>{names.get(b.userId)} · {b.date} · {b.side === "previous" ? "이전" : "다음"} 달 배정 없음</li>)}</ul></details>}
    </section>
    {proposal && <section className="card"><div className="card-header"><div><h2>확정표 재생성안</h2><p>현재 확정표는 유지 중입니다. 변경 {proposalChanges.length}칸을 검토하고 적용하면 최종 검토 상태로 전환됩니다.</p></div></div>
      <details><summary>기존 확정표 → 재생성안 변경 {proposalChanges.length}칸</summary><div className="table-wrap"><table className="data-table"><thead><tr><th>간호사</th><th>날짜</th><th>변경 전</th><th>변경 후</th></tr></thead><tbody>{proposalChanges.map((entry) => <tr key={`${entry.userId}:${entry.date}`}><td>{names.get(entry.userId)}</td><td>{entry.date}</td><td>{original.get(`${entry.userId}:${entry.date}`) ?? "미배정"}</td><td>{entry.shift}</td></tr>)}</tbody></table></div></details>
      <div className="schedule-toolbar-actions"><form action={applyScheduleProposalAction}><input type="hidden" name="scheduleId" value={schedule.id}/><button className="button primary">변경안 적용 · 최종 검토로 이동</button></form><form action={discardScheduleProposalAction}><input type="hidden" name="scheduleId" value={schedule.id}/><button className="button secondary">변경안 폐기</button></form></div>
    </section>}
    {currentReport?.repair && <section className="card"><div className="card-header"><div><h2>{proposal ? "재생성안" : "최근 생성"} 재배정 결과</h2><p>부족 {currentReport.repair.shortagesBefore}명 → {currentReport.repair.shortagesAfter}명 · {currentReport.repair.attempts}회 탐색 · {currentReport.repair.elapsedMs}ms</p></div></div>
      <p className="form-help">{currentReport.repair.status === "complete" ? "필수 조건을 유지하며 필요 인원을 채웠습니다." : "제한된 탐색에서 모두 해결하지 못했습니다. 해가 없다는 뜻은 아닙니다. 필요 인원·가용 인원을 확인하거나 직접 조정해 주세요."} 수동 편집 이후에는 위의 현재 검사 결과를 우선 확인하세요.</p>
      <details><summary>재배정 전후 변경 {currentReport.repair.changes.length}칸</summary><ul>{currentReport.repair.changes.map((c) => <li key={`${c.userId}:${c.date}`}>{names.get(c.userId)} · {c.date} · {c.beforeShift} → {c.afterShift}</li>)}</ul></details>
      {!!currentReport.warnings?.length && <details><summary>생성 당시 후보 제외 이유</summary>{currentReport.warnings.map((warning) => <div key={`${warning.date}:${warning.shift}`}><strong>{warning.date} · {warning.shift} · {warning.shortage}명 부족</strong><ul>{warning.candidates?.map((candidate) => <li key={candidate.userId}>{names.get(candidate.userId) ?? candidate.userId}: {candidate.reasons.join(" · ")}</li>)}</ul></div>)}</details>}
    </section>}
    <section className="card schedule-card"><div className="schedule-legend"><span><i className="shift shift-D">D</i> Day</span><span><i className="shift shift-E">E</i> Evening</span><span><i className="shift shift-N">N</i> Night</span><span><i className="shift shift-O">O</i> Off</span><span><i className="marker-sample">희</i> 희망 OFF</span><span><i className="marker-sample vacation">휴</i> 승인 휴가</span></div><ScheduleEditor key={`${schedule.id}:${schedule.revision}`} scheduleId={schedule.id} month={month} nurses={nurses} initialEntries={schedule.entries} requirements={requirements} offDates={offRequests} vacationDates={vacationDates}/></section>
    <FairnessTable metrics={fairness.metrics} history={history}/>
    <section className="dashboard-grid lower-grid"><details className="card requirement-card"><summary><span><Settings2 size={18}/> 날짜별 필요 인원 설정</span><small>펼치기</small></summary><RequirementCalendar scheduleId={schedule.id} month={month} requirements={requirements}/></details><article className="card requirement-change-log"><div className="card-header"><h2>최근 변경 기록</h2><History/></div><div className="timeline">{schedule.changeLogs.map((log) => <div key={log.id}><span></span><p><strong>{log.changedBy.name}</strong> · {changeLabels[log.action] ?? "근무표 변경"}<small>{log.date ? `${dayLabel(log.date)} · ${log.beforeShift ?? "미배정"} → ${log.afterShift ?? "미배정"}` : log.action === "STATUS_CHANGED" ? log.note?.split(" → ").map((value) => scheduleStatusLabel[value as keyof typeof scheduleStatusLabel] ?? value).join(" → ") : log.note}</small></p></div>)}{!schedule.changeLogs.length && <div className="empty-state compact">아직 변경 기록이 없습니다.</div>}</div></article></section>
  </>;
}
