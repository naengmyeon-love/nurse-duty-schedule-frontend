import { CalendarClock } from "lucide-react";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { ReadonlyScheduleTable } from "@/components/schedule-table";
import { ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, monthLabel } from "@/lib/date";
import type { NurseScheduleView } from "@/lib/domain";
import { countShifts } from "@/lib/statistics";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "확정 듀티표" };

export default async function NurseSchedulePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser("NURSE"); const requestedMonth = (await searchParams).month; const month = requestedMonth && isValidMonth(requestedMonth) ? requestedMonth : currentMonth();
  const { schedule, nurses } = await getView<NurseScheduleView>("nurse-schedule", { month });
  const mine = schedule?.entries.filter((entry) => entry.userId === user.id) ?? []; const counts = countShifts(mine.map((entry) => entry.shift));
  return <><PageHeader
    eyebrow="CONFIRMED SCHEDULE"
    title={`${monthLabel(month)} 확정 듀티표`}
    description="수간호사가 최종 확정한 병동 전체 근무표입니다."
    action={<MonthPicker month={month} path="/nurse/schedule" />}
  />
    {!schedule ? <section className="card empty-large"><span className="empty-icon"><CalendarClock/></span><h2>아직 공개된 근무표가 없습니다.</h2><p>작성 중인 임시 근무표는 확정 전까지 보이지 않습니다.</p></section> : <><section className="schedule-toolbar card"><div className="schedule-state"><span>공개 상태</span><ScheduleBadge status={schedule.status}/></div><div className="my-inline-stats"><strong>내 근무</strong><span>D {counts.D}</span><span>E {counts.E}</span><span>N {counts.N}</span><span>OFF {counts.O}</span></div></section><section className="card schedule-card"><div className="schedule-legend"><span><i className="shift shift-D">D</i> Day</span><span><i className="shift shift-E">E</i> Evening</span><span><i className="shift shift-N">N</i> Night</span><span><i className="shift shift-O">O</i> Off</span></div><ReadonlyScheduleTable month={month} nurses={nurses} entries={schedule.entries} highlightUserId={user.id}/></section></>}
  </>;
}
