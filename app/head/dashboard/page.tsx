import { AlertTriangle, ArrowRight, CalendarCheck2, ClipboardList, Plane, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { DayBars } from "@/components/day-bars";
import { DemoResetButton } from "@/components/demo-reset-button";
import { PageHeader } from "@/components/page-header";
import { ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, monthLabel } from "@/lib/date";
import type { HeadDashboardView } from "@/lib/domain";

export const metadata = { title: "대시보드" };

export default async function HeadDashboard() {
  const head = await requireUser("HEAD_NURSE");
  const month = currentMonth();
  const { nurses, offRequests, vacations, schedule } = await getView<HeadDashboardView>("head-dashboard", { month });
  const applied = new Set(offRequests.map((item) => item.userId)).size;
  const byDay = new Map<string, number>();
  offRequests.forEach((item) => byDay.set(item.date, (byDay.get(item.date) ?? 0) + 1));
  const busyDays = [...byDay.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => b.count - a.count || a.date.localeCompare(b.date)).slice(0, 8);
  return (
    <>
      <PageHeader eyebrow={`${monthLabel(month)} · ${head.ward.name}`} title={`${head.name}님, 좋은 하루예요.`} description="이번 달 신청 현황과 듀티 준비 상태를 확인하세요." action={<Link className="button primary" href={`/head/schedule?month=${month}`}>듀티표 열기 <ArrowRight size={16} /></Link>} />
      <section className="metric-grid">
        <article className="metric-card"><span className="metric-icon blue"><Users /></span><div><small>간호사</small><strong>{nurses.length}<em>명</em></strong><p>현재 근무 중인 인원</p></div></article>
        <article className="metric-card"><span className="metric-icon mint"><ClipboardList /></span><div><small>희망 OFF</small><strong>{offRequests.length}<em>건</em></strong><p>{applied}명이 신청했어요</p></div></article>
        <article className="metric-card"><span className="metric-icon violet"><Plane /></span><div><small>휴가 신청</small><strong>{vacations.length}<em>건</em></strong><p>이번 달과 겹치는 신청</p></div></article>
        <article className="metric-card"><span className="metric-icon amber"><UserCheck /></span><div><small>OFF 신청 완료</small><strong>{applied}<em>/ {nurses.length}명</em></strong><p>{Math.max(0, nurses.length - applied)}명 아직 미신청</p></div></article>
      </section>
      <section className="dashboard-grid">
        <article className="card span-2">
          <div className="card-header"><div><p className="eyebrow">OFF REQUESTS</p><h2>신청 집중 날짜</h2></div><Link href="/head/requests">전체 보기 <ArrowRight size={15} /></Link></div>
          <DayBars data={busyDays} warningAt={4} />
        </article>
        <article className="card status-card">
          <div className="card-header"><div><p className="eyebrow">SCHEDULE</p><h2>듀티표 상태</h2></div><CalendarCheck2 /></div>
          {schedule ? <><ScheduleBadge status={schedule.status} /><strong>{monthLabel(month)} 근무표</strong><p>{schedule.status === "CONFIRMED" ? "간호사에게 공개된 상태입니다." : "아직 간호사에게 공개되지 않았습니다."}</p><Link className="button secondary full" href={`/head/schedule?month=${month}`}>근무표 관리</Link></> : <><span className="empty-icon"><AlertTriangle /></span><strong>아직 근무표가 없어요</strong><p>이번 달 근무표를 생성해 작성을 시작하세요.</p><Link className="button secondary full" href={`/head/schedule?month=${month}`}>근무표 생성</Link></>}
        </article>
      </section>
      <section className="card demo-reset-card">
        <div><p className="eyebrow">DEMO MAINTENANCE</p><h2>데모 데이터 초기화</h2><p>모든 요청·근무표·변경 이력을 지우고 공개 가상 계정과 샘플 데이터로 복원합니다.</p></div>
        <DemoResetButton />
      </section>
    </>
  );
}
