import { Plane } from "lucide-react";
import { reviewVacationAction } from "@/app/actions";
import { DayBars } from "@/components/day-bars";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { RequestBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, dateRange, monthLabel, overlapDays } from "@/lib/date";
import type { HeadVacationsView } from "@/lib/domain";
import { vacationTypeLabel } from "@/lib/labels";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "휴가 현황" };

export default async function HeadVacationsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireUser("HEAD_NURSE"); const requestedMonth = (await searchParams).month; const month = requestedMonth && isValidMonth(requestedMonth) ? requestedMonth : currentMonth();
  const { vacations } = await getView<HeadVacationsView>("head-vacations", { month });
  const approved = vacations.filter((v) => v.status === "APPROVED"); const totalDays = approved.reduce((sum, v) => sum + overlapDays(v.startDate, v.endDate, month).length, 0);
  const typeDays = new Map<string, number>(); approved.forEach((v) => typeDays.set(v.type, (typeDays.get(v.type) ?? 0) + overlapDays(v.startDate, v.endDate, month).length));
  const byDay = new Map<string, number>(); approved.forEach((v) => dateRange(v.startDate, v.endDate).filter((d) => d.startsWith(month)).forEach((date) => byDay.set(date, (byDay.get(date) ?? 0) + 1)));
  const byNurse = new Map<string, number>(); approved.forEach((v) => byNurse.set(v.user.name, (byNurse.get(v.user.name) ?? 0) + overlapDays(v.startDate, v.endDate, month).length));
  return <><PageHeader eyebrow="VACATION" title="전체 휴가 현황" description={`${monthLabel(month)} 병동 휴가 현황과 승인 대기 신청을 관리하세요.`} action={<MonthPicker month={month} path="/head/vacations" />} />
    <section className="metric-grid vacation-metrics"><article className="metric-card feature"><span className="metric-icon violet"><Plane /></span><div><small>이번 달 승인 휴가</small><strong>{totalDays}<em>일</em></strong><p>{new Set(approved.map((v) => v.userId)).size}명의 휴가</p></div></article>{(["ANNUAL","VACATION","EDUCATION","OTHER"] as const).map((type) => <article className="metric-card" key={type}><div><small>{vacationTypeLabel[type]}</small><strong>{typeDays.get(type) ?? 0}<em>일</em></strong><p>승인된 휴가 기준</p></div></article>)}</section>
    <section className="dashboard-grid"><article className="card span-2"><div className="card-header"><div><h2>날짜별 휴가 인원</h2><p>승인된 휴가를 날짜별로 표시합니다.</p></div></div><DayBars data={[...byDay].map(([date,count])=>({date,count}))} warningAt={3} emptyText="승인된 휴가가 없습니다." /></article><article className="card"><div className="card-header"><div><h2>간호사별 사용 일수</h2></div></div><div className="rank-list">{[...byNurse].sort((a,b)=>b[1]-a[1]).map(([name,count]) => <div key={name}><span className="avatar small">{name[0]}</span><strong>{name}</strong><b>{count}일</b></div>)}{!byNurse.size && <div className="empty-state compact">집계할 휴가가 없습니다.</div>}</div></article></section>
    <section className="card table-card"><div className="card-header"><div><h2>휴가 신청 목록</h2><p>모든 간호사의 휴가·연차 신청입니다.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>간호사</th><th>기간</th><th>종류</th><th>메모</th><th>상태</th><th>검토</th></tr></thead><tbody>{vacations.map((v) => <tr key={v.id}><td><strong>{v.user.name}</strong></td><td>{v.startDate} ~ {v.endDate}</td><td>{vacationTypeLabel[v.type]}</td><td>{v.memo || "—"}</td><td><RequestBadge status={v.status}/></td><td><form className="row-actions" action={reviewVacationAction}><input type="hidden" name="id" value={v.id}/><button className="button tiny approve" name="status" value="APPROVED">승인</button><button className="button tiny reject" name="status" value="REJECTED">반려</button></form></td></tr>)}{!vacations.length && <tr><td colSpan={6}><div className="empty-state">이 달과 겹치는 휴가가 없습니다.</div></td></tr>}</tbody></table></div></section>
  </>;
}
