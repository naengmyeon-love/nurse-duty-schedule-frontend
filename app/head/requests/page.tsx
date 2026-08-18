import { PageHeader } from "@/components/page-header";
import { DayBars } from "@/components/day-bars";
import { RequestBadge } from "@/components/status-badge";
import { MonthPicker } from "@/components/month-picker";
import { reviewOffRequestAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, dayLabel, monthLabel } from "@/lib/date";
import type { HeadRequestsView } from "@/lib/domain";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "희망 OFF 현황" };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireUser("HEAD_NURSE"); const requestedMonth = (await searchParams).month; const month = requestedMonth && isValidMonth(requestedMonth) ? requestedMonth : currentMonth();
  const { requests } = await getView<HeadRequestsView>("head-requests", { month });
  const byDay = new Map<string, number>(); requests.forEach((request) => byDay.set(request.date, (byDay.get(request.date) ?? 0) + 1));
  return <><PageHeader eyebrow="OFF REQUESTS" title="희망 OFF 신청 현황" description={`${monthLabel(month)} 신청이 몰린 날짜와 개별 상태를 확인하세요.`} action={<MonthPicker month={month} path="/head/requests" />} />
    <section className="dashboard-grid"><article className="card span-2"><div className="card-header"><div><h2>날짜별 신청 인원</h2><p>4명 이상이면 경고로 표시합니다.</p></div></div><DayBars data={[...byDay].map(([date,count]) => ({date,count}))} warningAt={4} /></article><article className="card summary-card"><p className="eyebrow">MONTHLY TOTAL</p><strong>{requests.length}<small>건</small></strong><p>{new Set(requests.map((r) => r.userId)).size}명이 신청했어요.</p></article></section>
    <section className="card table-card"><div className="card-header"><div><h2>신청 목록</h2><p>희망 OFF는 실제 듀티의 OFF와 별도입니다.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>날짜</th><th>간호사</th><th>메모</th><th>상태</th><th>검토</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><strong>{dayLabel(request.date)}</strong></td><td>{request.user.name}</td><td>{request.memo || "—"}</td><td><RequestBadge status={request.status} /></td><td><form className="row-actions" action={reviewOffRequestAction}><input type="hidden" name="id" value={request.id}/><button className="button tiny approve" name="status" value="APPROVED">승인</button><button className="button tiny reject" name="status" value="REJECTED">반려</button></form></td></tr>)}{!requests.length && <tr><td colSpan={5}><div className="empty-state">이 달의 신청이 없습니다.</div></td></tr>}</tbody></table></div></section>
  </>;
}
