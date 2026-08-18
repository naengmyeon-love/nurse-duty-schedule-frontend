import { ArrowRight, CalendarCheck2, ClipboardCheck, Plane } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { RequestBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, dayLabel, monthLabel } from "@/lib/date";
import type { NurseHomeView } from "@/lib/domain";
import { countShifts } from "@/lib/statistics";

export const metadata = { title: "내 현황" };

export default async function NurseHome() {
  const user = await requireUser("NURSE"); const month = currentMonth();
  const { offRequests, vacations, schedule } = await getView<NurseHomeView>("nurse-home", { month });
  const counts = countShifts(schedule?.entries.map((entry) => entry.shift) ?? []);
  return <><PageHeader eyebrow={`${monthLabel(month)} · MY DUTY`} title={`${user.name} 간호사님, 안녕하세요.`} description="내 신청과 확정된 근무를 한눈에 확인하세요." />
    <section className="my-duty-banner"><div><p>이번 달 확정 근무</p><h2>{schedule ? `${schedule.entries.length}일이 배정되었어요` : "아직 확정된 근무표가 없어요"}</h2><span>{schedule ? "변경 사항은 이 화면에 바로 반영됩니다." : "수간호사가 확정하면 이곳에서 확인할 수 있어요."}</span></div>{schedule && <Link className="button light" href="/nurse/schedule">전체 듀티표 보기 <ArrowRight size={16}/></Link>}</section>
    <section className="shift-stat-grid">{(["D","E","N","O"] as const).map((shift) => <article key={shift}><span className={`shift shift-${shift}`}>{shift === "O" ? "OFF" : shift}</span><strong>{counts[shift]}</strong><small>회</small></article>)}</section>
    <section className="dashboard-grid"><article className="card span-2"><div className="card-header"><div><p className="eyebrow">MY REQUESTS</p><h2>이번 달 희망 OFF</h2></div><Link href="/nurse/request-off">신청하기 <ArrowRight size={15}/></Link></div><div className="request-chip-list">{offRequests.map((request) => <div key={request.id}><span><CalendarCheck2 size={17}/><strong>{dayLabel(request.date)}</strong></span><RequestBadge status={request.status}/></div>)}{!offRequests.length && <div className="empty-state compact">신청한 희망 OFF가 없습니다.</div>}</div></article><article className="card"><div className="card-header"><div><p className="eyebrow">VACATION</p><h2>휴가·연차</h2></div><Plane/></div>{vacations.slice(0,3).map((v) => <div className="vacation-preview" key={v.id}><span>{v.startDate}<br/><small>~ {v.endDate}</small></span><RequestBadge status={v.status}/></div>)}{!vacations.length && <div className="empty-state compact"><ClipboardCheck/>이번 달 휴가 신청이 없습니다.</div>}<Link className="button secondary full" href="/nurse/vacations">휴가 관리</Link></article></section>
  </>;
}
