import { ArrowLeftRight, HandHelping, Plus, UserRoundCheck } from "lucide-react";
import { cancelShiftChangeAction, createShiftChangeAction, respondShiftChangeAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { ShiftChangeBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { dayLabel } from "@/lib/date";
import type { NurseShiftChangesView } from "@/lib/domain";
import { shiftChangeTypeLabel, shiftLabel } from "@/lib/labels";

export const metadata = { title: "근무 변동 요청" };

const errorMessages: Record<string, string> = {
  missing: "변경할 근무와 사유를 모두 입력해 주세요.",
  "invalid-duty": "확정된 본인 근무만 변경 요청할 수 있습니다.",
  "past-duty": "이미 지난 근무는 변경 요청할 수 없습니다.",
  duplicate: "같은 날짜에 진행 중인 요청이 이미 있습니다.",
  "invalid-target": "요청할 간호사를 확인할 수 없습니다.",
  unavailable: "이미 처리되었거나 더 이상 응답할 수 없는 요청입니다.",
  forbidden: "이 요청에 응답할 권한이 없습니다.",
  conflict: "같은 날짜에 이미 승인 대기 중인 근무 변동이 있습니다.",
  stale: "요청 후 원본 근무가 바뀌었습니다. 새로 요청해 주세요.",
  "invalid-response": "응답 내용을 확인해 주세요.",
};

export default async function NurseShiftChangesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser("NURSE");
  const query = await searchParams;
  const { futureEntries, nurses, relatedRequests, openRequests } = await getView<NurseShiftChangesView>("nurse-shift-changes");
  const duties = futureEntries.filter((entry) => entry.shift === "D" || entry.shift === "E" || entry.shift === "N");
  const incoming = relatedRequests.filter((request) => request.targetUserId === user.id && request.status === "PENDING_TARGET");
  const mine = relatedRequests.filter((request) => request.requesterId === user.id);
  const participated = relatedRequests.filter((request) => request.targetUserId === user.id && request.status !== "PENDING_TARGET");
  const successMessage = query.created ? "근무 변동 요청을 등록했습니다." : query.accepted ? "요청을 수락했습니다. 수간호사 최종 승인을 기다립니다." : query.rejected ? "요청을 거절했습니다." : query.cancelled ? "요청을 취소했습니다." : null;

  return <>
    <PageHeader eyebrow="SHIFT CHANGE" title="근무 변동 요청" description="갑작스러운 휴가가 생기면 동료와 근무를 맞바꾸고 수간호사 승인을 받으세요." />
    {successMessage && <div className="alert success"><UserRoundCheck size={18}/><span>{successMessage}</span></div>}
    {query.error && <div className="alert error"><ArrowLeftRight size={18}/><span>{errorMessages[query.error] ?? "요청을 처리하지 못했습니다."}</span></div>}

    <section className="card">
      <div className="card-header"><div><h2>새 요청 만들기</h2><p>상대를 지정하지 않으면 병동 간호사 누구나 지원할 수 있습니다.</p></div><Plus/></div>
      <form className="shift-change-form" action={createShiftChangeAction}>
        <label>내 확정 근무<select name="scheduleEntryId" required defaultValue=""><option value="" disabled>근무 선택</option>{duties.map((duty) => <option key={duty.id} value={duty.id}>{dayLabel(duty.date)} · {shiftLabel[duty.shift!]}</option>)}</select></label>
        <label>요청할 간호사<select name="targetUserId" defaultValue=""><option value="">지정 안 함 (공개 요청)</option>{nurses.map((nurse) => <option key={nurse.id} value={nurse.id}>{nurse.name}</option>)}</select></label>
        <label className="grow">변동 사유<input name="reason" required maxLength={120} placeholder="예: 갑작스러운 가족 일정으로 휴가가 필요합니다."/></label>
        <button className="button primary" type="submit" disabled={!duties.length}>요청 등록</button>
      </form>
      {!duties.length && <p className="form-help">오늘 이후 변경 가능한 확정 근무가 없습니다.</p>}
    </section>

    {(incoming.length > 0 || openRequests.length > 0) && <section className="change-section">
      <div className="section-heading"><div><h2>응답할 요청</h2><p>수락 전 날짜와 현재 근무를 확인하세요.</p></div><HandHelping/></div>
      <div className="change-grid">
        {[...incoming, ...openRequests].map((request) => {
          const myShift = futureEntries.find((entry) => entry.scheduleId === request.scheduleId && entry.date === request.date)?.shift ?? "O";
          return <article className="card change-card" key={request.id}>
          <div className="change-card-top"><span className="avatar small">{request.requester.name[0]}</span><div><strong>{request.requester.name}</strong><small>{request.status === "OPEN" ? "공개 대체 요청" : "나에게 보낸 요청"}</small></div><ShiftChangeBadge status={request.status}/></div>
          <div className="swap-preview"><span><small>{dayLabel(request.date)} 내 근무</small><i className={`shift shift-${myShift}`}>{shiftLabel[myShift]}</i></span><ArrowLeftRight size={19}/><span><small>수락 후 내 근무</small><i className={`shift shift-${request.requesterShift}`}>{shiftLabel[request.requesterShift]}</i></span></div>
          <p className="change-reason">{request.reason || "사유 없음"}</p>
          <form className="row-actions" action={respondShiftChangeAction}><input type="hidden" name="id" value={request.id}/><button className="button approve" name="response" value="accept">수락</button>{request.status === "PENDING_TARGET" && <button className="button reject" name="response" value="reject">거절</button>}</form>
        </article>})}
      </div>
    </section>}

    <section className="change-section">
      <div className="section-heading"><div><h2>내가 보낸 요청</h2><p>진행 중인 요청은 최종 승인 전까지 취소할 수 있습니다.</p></div></div>
      <div className="change-list">
        {mine.map((request) => <article className="card change-row" key={request.id}><div><strong>{dayLabel(request.date)} · {shiftLabel[request.requesterShift]}</strong><small>{request.targetUser ? `${request.targetUser.name} 간호사와 ${shiftChangeTypeLabel[request.type]}` : "공개 대체 요청"}</small></div><p>{request.reason || "사유 없음"}</p><ShiftChangeBadge status={request.status}/>{["OPEN","PENDING_TARGET","PENDING_HEAD"].includes(request.status) && <form action={cancelShiftChangeAction}><input type="hidden" name="id" value={request.id}/><button className="button tiny danger">취소</button></form>}</article>)}
        {!mine.length && <div className="card empty-state">보낸 근무 변동 요청이 없습니다.</div>}
      </div>
    </section>

    {participated.length > 0 && <section className="change-section"><div className="section-heading"><div><h2>내가 참여한 요청</h2><p>수락한 요청의 최종 처리 상태입니다.</p></div></div><div className="change-list">{participated.map((request) => <article className="card change-row" key={request.id}><div><strong>{dayLabel(request.date)} · {request.requester.name}</strong><small>{shiftLabel[request.targetShift ?? "O"]} → {shiftLabel[request.requesterShift]}</small></div><p>{request.reason || "사유 없음"}</p><ShiftChangeBadge status={request.status}/></article>)}</div></section>}
  </>;
}
