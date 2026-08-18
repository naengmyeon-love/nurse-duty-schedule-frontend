import { AlertTriangle, CheckCircle2, History, Settings2 } from "lucide-react";
import { ensureScheduleAction, setScheduleStatusAction, updateRequirementAction } from "@/app/actions";
import { AutoGenerateButton } from "@/components/auto-generate-button";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { ScheduleEditor } from "@/components/schedule-editor";
import { ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, dateKey, dateRange, dayLabel, daysInMonth, monthLabel } from "@/lib/date";
import type { HeadScheduleView } from "@/lib/domain";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "듀티표 관리" };

export default async function HeadSchedulePage({ searchParams }: { searchParams: Promise<{ month?: string; generated?: string; shortages?: string; relaxed?: string; offMissed?: string; error?: string }> }) {
  await requireUser("HEAD_NURSE"); const query = await searchParams; const month = query.month && isValidMonth(query.month) ? query.month : currentMonth();
  const { schedule, nurses, offRequests, vacations } = await getView<HeadScheduleView>("head-schedule", { month });
  if (!schedule) return <><PageHeader eyebrow="SCHEDULE" title="듀티표 관리" description="월별 근무표를 만들고 확정하세요." action={<MonthPicker month={month} path="/head/schedule" />} /><section className="card empty-large"><span className="empty-icon"><Settings2 /></span><h2>{monthLabel(month)} 근무표가 아직 없습니다.</h2><p>근무표를 생성하면 날짜별 필요 인원과 D·E·N·OFF를 편집할 수 있습니다.</p><form action={ensureScheduleAction}><input type="hidden" name="month" value={month}/><button className="button primary large">이 달 근무표 생성</button></form></section></>;
  const vacationDates = vacations.flatMap((v) => dateRange(v.startDate, v.endDate).filter((date) => date.startsWith(month)).map((date) => ({ userId: v.userId, date })));
  const requirements = schedule.requirements.length ? schedule.requirements : Array.from({ length: daysInMonth(month) }, (_, i) => ({ id: 0, scheduleId: schedule.id, date: dateKey(month, i + 1), dayCount: 2, eveningCount: 2, nightCount: 1 }));
  return <><PageHeader eyebrow="SCHEDULE" title={`${monthLabel(month)} 듀티표`} description="셀에서 근무를 선택하면 바로 저장됩니다. ‘희’는 희망 OFF, ‘휴’는 승인 휴가입니다." action={<MonthPicker month={month} path="/head/schedule" />} />
    {query.generated === "1" && <div className={Number(query.shortages) > 0 ? "alert warning" : "alert success"}><CheckCircle2 size={18}/><span><strong>자동 듀티 생성 완료.</strong> 인원 부족 {query.shortages ?? 0}건 · 희망 OFF 미반영 {query.offMissed ?? 0}건 · 제약 완화 {query.relaxed ?? 0}건입니다.</span></div>}
    {query.error && <div className="alert error"><AlertTriangle size={18}/><span>{query.error === "missing-data" ? "활성 간호사 또는 날짜별 필요 인원 데이터가 없어 자동 생성할 수 없습니다." : "근무표를 찾을 수 없습니다."}</span></div>}
    <section className="schedule-toolbar card"><div className="schedule-state"><span>현재 상태</span><ScheduleBadge status={schedule.status}/></div><div className="schedule-toolbar-actions"><AutoGenerateButton scheduleId={schedule.id} confirmed={schedule.status === "CONFIRMED"}/><form className="status-actions" action={setScheduleStatusAction}><input type="hidden" name="scheduleId" value={schedule.id}/><button className="button secondary" name="status" value="REQUEST">신청 기간</button><button className="button secondary" name="status" value="DRAFT">작성 중</button><button className="button secondary" name="status" value="REVIEW">최종 검토</button><button className="button confirm" name="status" value="CONFIRMED"><CheckCircle2 size={17}/> 근무표 확정</button></form></div></section>
    <p className="auto-rule-note">자동 생성 기준: 승인 휴가·OFF 및 N 다음날 OFF 우선 · E→D 제한 · Night/연속근무 한도 · 주말·Night 균등 · 경력 균형</p>
    {schedule.status === "CONFIRMED" && <div className="alert warning"><AlertTriangle size={18}/><span>확정된 근무표입니다. 지금 수정하면 변경 기록이 자동으로 남고 간호사 화면에 즉시 반영됩니다.</span></div>}
    <section className="card schedule-card"><div className="schedule-legend"><span><i className="shift shift-D">D</i> Day</span><span><i className="shift shift-E">E</i> Evening</span><span><i className="shift shift-N">N</i> Night</span><span><i className="shift shift-O">O</i> Off</span><span><i className="marker-sample">희</i> 희망 OFF</span><span><i className="marker-sample vacation">휴</i> 승인 휴가</span></div><ScheduleEditor scheduleId={schedule.id} month={month} nurses={nurses} initialEntries={schedule.entries} requirements={requirements} offDates={offRequests} vacationDates={vacationDates}/></section>
    <section className="dashboard-grid lower-grid"><details className="card span-2"><summary><span><Settings2 size={18}/> 날짜별 필요 인원 설정</span><small>펼치기</small></summary><div className="requirement-grid">{requirements.map((r) => <form action={updateRequirementAction} key={r.date}><input type="hidden" name="scheduleId" value={schedule.id}/><input type="hidden" name="date" value={r.date}/><strong>{dayLabel(r.date)}</strong><label>D <input name="dayCount" type="number" min="0" max="99" defaultValue={r.dayCount}/></label><label>E <input name="eveningCount" type="number" min="0" max="99" defaultValue={r.eveningCount}/></label><label>N <input name="nightCount" type="number" min="0" max="99" defaultValue={r.nightCount}/></label><button className="button tiny secondary">저장</button></form>)}</div></details><article className="card"><div className="card-header"><div><h2>최근 변경 기록</h2></div><History/></div><div className="timeline">{schedule.changeLogs.map((log) => <div key={log.id}><span></span><p><strong>{log.changedBy.name}</strong> · {log.action === "STATUS_CHANGED" ? "상태 변경" : log.action === "AUTO_GENERATED" ? "자동 듀티 생성" : log.action === "CONFIRMED_AUTO_GENERATED" ? "확정표 자동 수정" : log.action === "CONFIRMED_SCHEDULE_EDITED" ? "확정표 수정" : log.action === "SHIFT_CHANGE_APPROVED" ? "근무 변동 승인" : "근무 수정"}<small>{log.date ? `${dayLabel(log.date)} · ${log.beforeShift ?? "미지정"} → ${log.afterShift ?? "미지정"}` : log.note}</small></p></div>)}{!schedule.changeLogs.length && <div className="empty-state compact">아직 변경 기록이 없습니다.</div>}</div></article></section>
  </>;
}
