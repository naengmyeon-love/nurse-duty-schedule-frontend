import { AlertTriangle, ArrowLeftRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ShiftChangeReviewActions } from "@/components/shift-change-review-actions";
import { ShiftChangeBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { dayLabel } from "@/lib/date";
import { shiftChangeTypeLabel, shiftLabel } from "@/lib/labels";
import { getView } from "@/lib/backend";
import type { HeadShiftChangesView } from "@/lib/domain";

export const metadata = { title: "근무 변동 승인" };

const errorMessages: Record<string, string> = {
  "not-found": "요청을 찾을 수 없거나 이미 처리되었습니다.",
  unavailable: "확정 상태의 근무표만 변경할 수 있습니다.",
  stale: "요청 후 원본 근무가 변경되어 요청을 자동 취소했습니다.",
  constraints: "필수 조건 위반이 있어 승인하지 않았습니다. 원본 근무표를 조정한 뒤 다시 검토하세요.",
};

export default async function HeadShiftChangesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser("HEAD_NURSE");
  const query = await searchParams;
  const { reviewItems, history } = await getView<HeadShiftChangesView>("head-shift-changes");

  return <>
    <PageHeader eyebrow="SHIFT CHANGE REVIEW" title="근무 변동 승인" description="간호사끼리 합의한 교환·대체 요청을 검토하고 확정표에 반영하세요." />
    {query.approved && <div className="alert success"><CheckCircle2 size={18}/><span>근무 변동을 승인하고 확정표에 반영했습니다.</span></div>}
    {query.rejected && <div className="alert info"><ClipboardCheck size={18}/><span>근무 변동 요청을 반려했습니다.</span></div>}
    {query.error && <div className="alert error"><AlertTriangle size={18}/><span>{query.message || errorMessages[query.error] || "요청을 처리하지 못했습니다."}</span></div>}
    <div className="alert info"><ArrowLeftRight size={18}/><span>같은 날짜의 두 근무를 교환하므로 날짜별 D/E/N 총원은 바뀌지 않습니다. 월 경계를 포함한 휴식·연속근무·휴가와 전체 필요 인원을 다시 검사합니다. 필수 조건은 강제 승인으로 우회할 수 없습니다.</span></div>

    <section className="change-section">
      <div className="section-heading"><div><h2>최종 승인 대기</h2><p>{reviewItems.length}건의 합의된 요청이 있습니다.</p></div></div>
      <div className="review-grid">
        {reviewItems.map(({ request, warnings }) => <article className="card review-card" key={request.id}>
          <div className="change-card-top"><div><strong>{dayLabel(request.date)} · {shiftChangeTypeLabel[request.type]}</strong><small>{request.schedule.month} 확정표</small></div><ShiftChangeBadge status={request.status}/></div>
          <div className="exchange-line"><span><small>요청자</small><strong>{request.requester.name}</strong><i className={`shift shift-${request.requesterShift}`}>{shiftLabel[request.requesterShift]}</i></span><ArrowLeftRight/><span><small>수락자</small><strong>{request.targetUser?.name ?? "확인 불가"}</strong><i className={`shift shift-${request.targetShift ?? "O"}`}>{shiftLabel[request.targetShift ?? "O"]}</i></span></div>
          <p className="change-reason"><strong>사유</strong> {request.reason || "사유 없음"}</p>
          {warnings.length > 0 ? <div className="constraint-box"><strong><AlertTriangle size={16}/> 승인을 막는 필수 조건 충돌 {warnings.length}건</strong><ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : <div className="constraint-ok"><CheckCircle2 size={16}/> 현재 검사에서 필수 조건 위반이 없습니다.</div>}
          <ShiftChangeReviewActions id={request.id} warnings={warnings}/>
        </article>)}
        {!reviewItems.length && <div className="card empty-state">최종 승인 대기 중인 근무 변동이 없습니다.</div>}
      </div>
    </section>

    <section className="card table-card"><div className="card-header"><div><h2>최근 처리 이력</h2><p>승인·반려·취소된 근무 변동 요청입니다.</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>날짜</th><th>요청자</th><th>상대</th><th>변경</th><th>상태</th><th>처리자·메모</th></tr></thead><tbody>{history.map((request) => <tr key={request.id}><td>{dayLabel(request.date)}</td><td><strong>{request.requester.name}</strong></td><td>{request.targetUser?.name ?? "공개 요청"}</td><td>{shiftLabel[request.requesterShift]} ↔ {shiftLabel[request.targetShift ?? "O"]}</td><td><ShiftChangeBadge status={request.status}/></td><td>{request.reviewedBy?.name ?? "—"}{request.reviewNote ? ` · ${request.reviewNote}` : ""}</td></tr>)}{!history.length && <tr><td colSpan={6}><div className="empty-state">처리 이력이 없습니다.</div></td></tr>}</tbody></table></div></section>
  </>;
}
