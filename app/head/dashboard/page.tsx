import { AlertTriangle, BedSingle, CalendarOff, CheckCircle2, Clock3, Moon, Sun, Sunset } from "lucide-react";
import Link from "next/link";
import { DemoResetButton } from "@/components/demo-reset-button";
import { PageHeader } from "@/components/page-header";
import { HandoffBadge, ScheduleBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, currentMonth, dayLabel, monthLabel } from "@/lib/date";
import type { HeadDashboardView } from "@/lib/domain";

export const metadata = { title: "대시보드" };

export default async function HeadDashboard() {
  const head = await requireUser("HEAD_NURSE");
  const month = currentMonth();
  const date = currentDateInKorea();
  const { schedule, patients, todayEntries, todayHandoffs, todayUnavailableUserIds } = await getView<HeadDashboardView>("head-dashboard", { month, date });
  const shiftCount = (shift: "D" | "E" | "N") => todayEntries.filter((entry) => entry.shift === shift).length;
  const handoffCount = (status: "CONFIRMED" | "DELIVERED" | "NOT_STARTED") => todayHandoffs.filter((item) => item.status === status).length;

  return (
    <>
      <PageHeader
        eyebrow={dayLabel(date) + " · " + head.ward.name}
        title={head.name + "님, 병동 현황입니다."}
        description="오늘 근무·환자배정·인수인계 상황을 한눈에 확인하세요."
        action={<Link className="button primary" href={"/head/patient-assignments?date=" + date + "&shift=D"}>환자배정 열기</Link>}
      />
      <section className="metric-grid ward-metric-grid">
        <article className="metric-card"><span className="metric-icon blue"><BedSingle /></span><div><small>전체 환자</small><strong>{patients.length}<em>명</em></strong><p>현재 입원</p></div></article>
        <article className="metric-card"><span className="metric-icon day"><Sun /></span><div><small>D 근무</small><strong>{shiftCount("D")}<em>명</em></strong><p>Day</p></div></article>
        <article className="metric-card"><span className="metric-icon evening"><Sunset /></span><div><small>E 근무</small><strong>{shiftCount("E")}<em>명</em></strong><p>Evening</p></div></article>
        <article className="metric-card"><span className="metric-icon night"><Moon /></span><div><small>N 근무</small><strong>{shiftCount("N")}<em>명</em></strong><p>Night</p></div></article>
        <article className="metric-card"><span className="metric-icon mint"><CheckCircle2 /></span><div><small>인계 완료</small><strong>{handoffCount("CONFIRMED")}<em>건</em></strong><p>확인까지 완료</p></div></article>
        <article className="metric-card"><span className="metric-icon violet"><Clock3 /></span><div><small>확인 대기</small><strong>{handoffCount("DELIVERED")}<em>건</em></strong><p>수신자 확인 필요</p></div></article>
        <article className="metric-card"><span className="metric-icon amber"><AlertTriangle /></span><div><small>인계 미작성</small><strong>{handoffCount("NOT_STARTED")}<em>건</em></strong><p>작성 필요</p></div></article>
        <article className="metric-card"><span className="metric-icon rose"><CalendarOff /></span><div><small>휴가 / OFF</small><strong>{todayUnavailableUserIds.length}<em>명</em></strong><p>오늘 승인 인원</p></div></article>
      </section>

      <section className="card table-card">
        <div className="card-header">
          <div><p className="eyebrow">TODAY HANDOFF</p><h2>인수인계 현황</h2><p>미작성과 확인 대기 항목을 우선 확인하세요.</p></div>
          <Link href={"/head/handoffs?date=" + date}>전체 보기</Link>
        </div>
        <div className="table-wrap">
          <table className="data-table handoff-table">
            <thead><tr><th>병실</th><th>환자</th><th>현재 담당</th><th>다음 담당</th><th>근무 전환</th><th>인계 상태</th><th>확인 상태</th></tr></thead>
            <tbody>
              {todayHandoffs.map((handoff) => (
                <tr className={handoff.status === "NOT_STARTED" || handoff.status === "DELIVERED" ? "needs-attention" : ""} key={handoff.id}>
                  <td><strong>{handoff.patient.room}호</strong></td>
                  <td>{handoff.patient.displayName}</td>
                  <td>{handoff.fromNurse.name}</td>
                  <td>{handoff.toNurse.name}</td>
                  <td>{handoff.fromShift} → {handoff.toShift}</td>
                  <td><HandoffBadge status={handoff.status} /></td>
                  <td>{handoff.confirmation ? "확인 완료" : "확인 필요"}</td>
                </tr>
              ))}
              {!todayHandoffs.length && <tr><td colSpan={7}><div className="empty-state">오늘 생성된 인수인계가 없습니다.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="card status-card compact-status-card">
          <div className="card-header"><div><p className="eyebrow">SCHEDULE</p><h2>듀티표 상태</h2></div></div>
          {schedule ? (
            <><ScheduleBadge status={schedule.status} /><strong>{monthLabel(month)} 근무표</strong><p>{schedule.status === "CONFIRMED" ? "간호사에게 공개된 상태입니다." : "아직 작성 중입니다."}</p><Link className="button secondary full" href={"/head/schedule?month=" + month}>근무표 관리</Link></>
          ) : (
            <><span className="empty-icon"><AlertTriangle /></span><strong>근무표가 없습니다.</strong><Link className="button secondary full" href={"/head/schedule?month=" + month}>근무표 생성</Link></>
          )}
        </article>
        <article className="card demo-reset-card">
          <div><p className="eyebrow">DEMO MAINTENANCE</p><h2>데모 데이터 초기화</h2><p>환자·배정·인수인계를 포함한 모든 가상 데이터를 초기 상태로 복원합니다.</p></div>
          <DemoResetButton />
        </article>
      </section>
    </>
  );
}
