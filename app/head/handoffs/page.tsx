import { CheckCircle2, CircleAlert, ClipboardPenLine, Clock3 } from "lucide-react";
import { CareContextPicker } from "@/components/care-context-picker";
import { PageHeader } from "@/components/page-header";
import { HandoffBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, dayLabel } from "@/lib/date";
import type { HeadHandoffsView } from "@/lib/domain";
import { isValidDate } from "@/lib/validation";

export const metadata = { title: "인수인계 관리" };

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
export default async function HeadHandoffsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireUser("HEAD_NURSE");
  const query = await searchParams;
  const date = query.date && isValidDate(query.date) ? query.date : currentDateInKorea();
  const { handoffs } = await getView<HeadHandoffsView>("head-handoffs", { date });
  const confirmed = handoffs.filter((item) => item.status === "CONFIRMED").length;
  const waiting = handoffs.filter((item) => item.status === "DELIVERED").length;
  const unwritten = handoffs.filter((item) => item.status === "NOT_STARTED").length;

  return (
    <>
      <PageHeader
        eyebrow="WARD HANDOFF"
        title={dayLabel(date) + " 병동 인수인계"}
        description="환자별 이전 담당자와 다음 담당자, 작성·확인 상태를 관리합니다."
        action={<CareContextPicker date={date} path="/head/handoffs" showShift={false} />}
      />
      <section className="metric-grid">
        <article className="metric-card"><span className="metric-icon blue"><ClipboardPenLine /></span><div><small>전체 인계</small><strong>{handoffs.length}<em>건</em></strong><p>선택 날짜 관련</p></div></article>
        <article className="metric-card"><span className="metric-icon mint"><CheckCircle2 /></span><div><small>확인 완료</small><strong>{confirmed}<em>건</em></strong><p>다음 담당자 확인</p></div></article>
        <article className="metric-card"><span className="metric-icon violet"><Clock3 /></span><div><small>확인 대기</small><strong>{waiting}<em>건</em></strong><p>전달 완료 상태</p></div></article>
        <article className="metric-card"><span className="metric-icon amber"><CircleAlert /></span><div><small>미작성</small><strong>{unwritten}<em>건</em></strong><p>즉시 확인 필요</p></div></article>
      </section>

      <section className="card table-card handoff-table-card">
        <div className="card-header"><div><h2>환자별 인수인계 현황</h2><p>D → E → N → 다음 날 D 순서로 자동 연결됩니다.</p></div></div>
        <div className="table-wrap">
          <table className="data-table handoff-table">
            <thead><tr><th>병실 / 환자</th><th>근무 전환</th><th>현재 담당</th><th>다음 담당</th><th>인계 상태</th><th>확인</th><th>업데이트</th></tr></thead>
            <tbody>
              {handoffs.map((handoff) => (
                <tr className={handoff.status === "NOT_STARTED" ? "needs-attention" : ""} key={handoff.id}>
                  <td>
                    <details className="handoff-detail">
                      <summary><strong>{handoff.patient.room}호</strong><span>{handoff.patient.displayName}</span></summary>
                      <div className="handoff-content-preview">
                        <p><strong>현재 상태</strong>{handoff.content.currentStatus || "—"}</p>
                        <p><strong>주의사항</strong>{handoff.content.cautions || "—"}</p>
                        <p><strong>해야 할 업무</strong>{handoff.content.tasks || "—"}</p>
                        <p><strong>미완료 업무</strong>{handoff.content.pendingTasks || "—"}</p>
                        <p><strong>추가 메모</strong>{handoff.content.memo || "—"}</p>
                      </div>
                    </details>
                  </td>
                  <td><span className={"shift shift-" + handoff.fromShift}>{handoff.fromShift}</span><span className="handoff-arrow">→</span><span className={"shift shift-" + handoff.toShift}>{handoff.toShift}</span></td>
                  <td>{handoff.fromNurse.name}</td>
                  <td>{handoff.toNurse.name}</td>
                  <td><HandoffBadge status={handoff.status} /></td>
                  <td>{handoff.confirmation ? handoff.confirmation.confirmedBy?.name ?? handoff.toNurse.name : "확인 필요"}</td>
                  <td>{formatTime(handoff.updatedAt)}</td>
                </tr>
              ))}
              {!handoffs.length && <tr><td colSpan={7}><div className="empty-state">생성된 인수인계가 없습니다. 연속 근무조의 환자배정을 먼저 완료하세요.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
