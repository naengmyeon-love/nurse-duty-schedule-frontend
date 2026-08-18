import { ArrowDown, CheckCircle2, ClipboardPenLine, Inbox } from "lucide-react";
import { confirmHandoffAction, saveHandoffAction } from "@/app/actions";
import { CareContextPicker } from "@/components/care-context-picker";
import { PageHeader } from "@/components/page-header";
import { HandoffBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, dayLabel } from "@/lib/date";
import type { NurseHandoffsView } from "@/lib/domain";
import { isValidDate } from "@/lib/validation";

export const metadata = { title: "인수인계" };

export default async function NurseHandoffsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireUser("NURSE");
  const query = await searchParams;
  const date = query.date && isValidDate(query.date) ? query.date : currentDateInKorea();
  const { outgoing, incoming } = await getView<NurseHandoffsView>("nurse-handoffs", { date });
  const confirmNeeded = incoming.filter((item) => item.status === "DELIVERED").length;

  return (
    <>
      <PageHeader
        eyebrow="MY HANDOFF"
        title={dayLabel(date) + " 인수인계"}
        description="내가 인계할 환자를 작성하고, 인수받을 내용을 확인하세요."
        action={<CareContextPicker date={date} path="/nurse/handoffs" showShift={false} />}
      />

      <section className="handoff-summary-strip">
        <div><ClipboardPenLine /><span>인계할 환자<strong>{outgoing.length}명</strong></span></div>
        <div><Inbox /><span>인수받을 환자<strong>{incoming.length}명</strong></span></div>
        <div className={confirmNeeded ? "warning" : ""}><CheckCircle2 /><span>확인 필요<strong>{confirmNeeded}건</strong></span></div>
      </section>

      <section className="change-section">
        <div className="section-heading"><div><p className="eyebrow">OUTGOING</p><h2>내가 인계해야 할 환자</h2></div><ClipboardPenLine /></div>
        <div className="handoff-form-grid">
          {outgoing.map((handoff) => (
            <article className="card handoff-form-card" key={handoff.id}>
              <div className="handoff-card-header">
                <div className="patient-title"><span className="room-number">{handoff.patient.room}호</span><div><strong>{handoff.patient.displayName}</strong><small>{handoff.fromShift} → {handoff.toShift} · {handoff.toNurse.name} 간호사</small></div></div>
                <HandoffBadge status={handoff.status} />
              </div>
              {handoff.status === "CONFIRMED" ? (
                <div className="confirmed-note"><CheckCircle2 size={17} /> 다음 근무자가 확인한 인수인계입니다.</div>
              ) : (
                <form className="handoff-form" action={saveHandoffAction}>
                  <input type="hidden" name="id" value={handoff.id} />
                  <label><span>현재 상태</span><textarea name="currentStatus" defaultValue={handoff.content.currentStatus ?? ""} placeholder="환자의 현재 상태와 변화" /></label>
                  <label><span>주의사항</span><textarea name="cautions" defaultValue={handoff.content.cautions ?? ""} placeholder="관찰 포인트와 안전 주의사항" /></label>
                  <label><span>해야 할 업무</span><textarea name="tasks" defaultValue={handoff.content.tasks ?? ""} placeholder="다음 근무에서 해야 할 업무" /></label>
                  <label><span>미완료 업무</span><textarea name="pendingTasks" defaultValue={handoff.content.pendingTasks ?? ""} placeholder="아직 완료하지 못한 업무" /></label>
                  <label className="full"><span>추가 메모</span><textarea name="memo" defaultValue={handoff.content.memo ?? ""} placeholder="추가 공유 내용" /></label>
                  <div className="handoff-actions">
                    <button className="button secondary" name="status" value="IN_PROGRESS">임시 저장</button>
                    <button className="button primary" name="status" value="DELIVERED">인계 전달 완료</button>
                  </div>
                </form>
              )}
            </article>
          ))}
          {!outgoing.length && <div className="card empty-state">이 날짜에 인계할 환자가 없습니다.</div>}
        </div>
      </section>

      <section className="change-section">
        <div className="section-heading"><div><p className="eyebrow">INCOMING</p><h2>내가 인수받아야 할 환자</h2></div><Inbox /></div>
        <div className="handoff-receive-grid">
          {incoming.map((handoff) => (
            <article className={"card handoff-receive-card " + (handoff.status === "DELIVERED" ? "needs-confirmation" : "")} key={handoff.id}>
              <div className="handoff-card-header">
                <div className="patient-title"><span className="room-number">{handoff.patient.room}호</span><div><strong>{handoff.patient.displayName}</strong><small>이전 담당 {handoff.fromNurse.name} · {handoff.fromShift} → {handoff.toShift}</small></div></div>
                <HandoffBadge status={handoff.status} />
              </div>
              <ArrowDown className="handoff-down" size={18} />
              <div className="handoff-content-preview">
                <p><strong>현재 상태</strong>{handoff.content.currentStatus || "아직 작성되지 않았습니다."}</p>
                <p><strong>주의사항</strong>{handoff.content.cautions || "—"}</p>
                <p><strong>해야 할 업무</strong>{handoff.content.tasks || "—"}</p>
                <p><strong>미완료 업무</strong>{handoff.content.pendingTasks || "—"}</p>
                <p><strong>추가 메모</strong>{handoff.content.memo || "—"}</p>
              </div>
              {handoff.status === "DELIVERED" && (
                <form action={confirmHandoffAction}>
                  <input type="hidden" name="id" value={handoff.id} />
                  <button className="button confirm full" type="submit"><CheckCircle2 size={17} /> 인계 확인</button>
                </form>
              )}
              {handoff.status === "CONFIRMED" && <div className="confirmed-note"><CheckCircle2 size={17} /> 확인 완료 · 기록 시간이 저장되었습니다.</div>}
            </article>
          ))}
          {!incoming.length && <div className="card empty-state">이 날짜에 인수받을 환자가 없습니다.</div>}
        </div>
      </section>
    </>
  );
}
