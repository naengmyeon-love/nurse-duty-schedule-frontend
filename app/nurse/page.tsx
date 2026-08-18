import { ArrowRight, BedSingle, CalendarOff, CheckCircle2, ClipboardPenLine, Inbox, Stethoscope } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { HandoffBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, currentMonth, dayLabel } from "@/lib/date";
import type { NurseHomeView } from "@/lib/domain";

export const metadata = { title: "대시보드" };

export default async function NurseHome() {
  const user = await requireUser("NURSE");
  const month = currentMonth();
  const date = currentDateInKorea();
  const { offRequests, vacations, todayDuty, assignments, outgoing, incoming } = await getView<NurseHomeView>("nurse-home", { month, date });
  const needsWrite = outgoing.filter((item) => item.status === "NOT_STARTED" || item.status === "IN_PROGRESS");
  const needsConfirm = incoming.filter((item) => item.status === "DELIVERED");
  const monthlyAway = offRequests.filter((item) => item.status === "APPROVED").length + vacations.filter((item) => item.status === "APPROVED").length;

  return (
    <>
      <PageHeader
        eyebrow={dayLabel(date) + " · MY DASHBOARD"}
        title={user.name + " 간호사님, 안녕하세요."}
        description="오늘 내 근무와 담당 환자, 인수인계할 일을 확인하세요."
      />
      <section className="nurse-focus-banner">
        <div><p>오늘 근무</p><strong>{todayDuty?.shift === "O" ? "OFF" : todayDuty?.shift ?? "미배정"}</strong><span>{todayDuty?.shift && todayDuty.shift !== "O" ? "확정 듀티표 기준" : "오늘 예정된 근무가 없습니다."}</span></div>
        <Stethoscope />
      </section>
      <section className="metric-grid nurse-metric-grid">
        <article className="metric-card"><span className="metric-icon blue"><BedSingle /></span><div><small>담당 환자</small><strong>{assignments.length}<em>명</em></strong><p>오늘 내 배정</p></div></article>
        <article className="metric-card"><span className="metric-icon violet"><ClipboardPenLine /></span><div><small>인계할 환자</small><strong>{outgoing.length}<em>명</em></strong><p>{needsWrite.length}건 작성 필요</p></div></article>
        <article className="metric-card"><span className="metric-icon mint"><Inbox /></span><div><small>인수받을 환자</small><strong>{incoming.length}<em>명</em></strong><p>오늘 연결 건</p></div></article>
        <article className="metric-card"><span className="metric-icon amber"><CheckCircle2 /></span><div><small>확인 필요</small><strong>{needsConfirm.length}<em>건</em></strong><p>전달 완료 항목</p></div></article>
        <article className="metric-card"><span className="metric-icon rose"><CalendarOff /></span><div><small>이번 달 OFF / 휴가</small><strong>{monthlyAway}<em>건</em></strong><p>승인된 신청</p></div></article>
      </section>

      <section className="dashboard-grid nurse-dashboard-grid">
        <article className="card span-2">
          <div className="card-header"><div><p className="eyebrow">MY PATIENTS</p><h2>내 담당 환자</h2></div><Link href="/nurse/patient-assignments">전체 보기 <ArrowRight size={15} /></Link></div>
          <div className="dashboard-patient-list">
            {assignments.map(({ patient, shift }) => (
              <div key={patient.id}><span className="room-number">{patient.room}호</span><strong>{patient.displayName}</strong><span className={"shift shift-" + shift}>{shift}</span><div className="tag-list">{patient.warningTags.map((tag) => <span className="warning-tag" key={tag}>{tag}</span>)}</div></div>
            ))}
            {!assignments.length && <div className="empty-state compact">오늘 배정된 환자가 없습니다.</div>}
          </div>
        </article>

        <article className="card">
          <div className="card-header"><div><p className="eyebrow">TO WRITE</p><h2>작성해야 할 인계</h2></div><ClipboardPenLine /></div>
          <div className="dashboard-handoff-list">
            {needsWrite.slice(0, 5).map((handoff) => <div key={handoff.id}><span><strong>{handoff.patient.room}호</strong>{handoff.patient.displayName}</span><HandoffBadge status={handoff.status} /></div>)}
            {!needsWrite.length && <div className="empty-state compact">작성할 인계가 없습니다.</div>}
          </div>
          <Link className="button secondary full" href={"/nurse/handoffs?date=" + date}>인수인계 작성</Link>
        </article>

        <article className="card">
          <div className="card-header"><div><p className="eyebrow">TO CONFIRM</p><h2>확인해야 할 인계</h2></div><Inbox /></div>
          <div className="dashboard-handoff-list">
            {needsConfirm.slice(0, 5).map((handoff) => <div key={handoff.id}><span><strong>{handoff.patient.room}호</strong>이전 담당 {handoff.fromNurse.name}</span><HandoffBadge status={handoff.status} /></div>)}
            {!needsConfirm.length && <div className="empty-state compact">확인할 인계가 없습니다.</div>}
          </div>
          <Link className="button primary full" href={"/nurse/handoffs?date=" + date}>인계 확인하기</Link>
        </article>
      </section>
    </>
  );
}
