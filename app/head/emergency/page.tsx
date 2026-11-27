import Link from "next/link";
import { requestEmergencyCoverAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { getView } from "@/lib/backend";
import { currentDateInKorea, dayLabel } from "@/lib/date";
import { isValidDate } from "@/lib/validation";

type EmergencyView = {
  date: string; selectedId: number | null; pending: boolean; escalated: boolean;
  escalations: { id: number; note: string; changedBy: { name: string } }[];
  duties: { id: number; shift: string; user: { name: string } }[];
  candidates: { userId: number; name: string; requestedOff: boolean; workDays: number }[];
};

export const metadata = { title: "긴급 결원 대응" };

export default async function EmergencyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const today = currentDateInKorea();
  const date = q.date && isValidDate(q.date) && q.date >= today ? q.date : today;
  const data = await getView<EmergencyView>("head-emergency", { date, entryId: q.entryId ?? "" });
  const selected = data.duties.find(d => d.id === data.selectedId);
  return <>
    <PageHeader title="긴급 결원 대응" description="확정표에서 결원 근무를 선택하고 같은 날 쉴 예정인 간호사에게 대체를 요청하세요."
      action={<Link className="button secondary" href="/head/emergency/trial">무작위 결원 비교 실험</Link>} />
    {q.sent && <div className="alert success" role="status">대체 요청을 보냈습니다. 간호사가 수락하면 <Link href="/head/shift-changes">근무 변동 승인</Link>에서 확정하세요.</div>}
    {q.logged && <div className="alert info" role="status">미충원 내역을 기록했습니다. 병동 책임자에게 지원 인력을 요청하세요.</div>}
    {q.error && <div className="alert error" role="alert">근무 또는 후보 조건이 바뀌었습니다. 근무를 다시 선택하세요.</div>}
    <section className="card">
      <div className="card-header"><h2>결원 근무 선택</h2></div>
      <form className="inline-form">
        <label>근무일<input type="date" name="date" min={today} defaultValue={date} required /></label>
        <button className="button secondary">확정 근무 조회</button>
      </form>
      {data.duties.length > 0 ? <form className="inline-form" key={date}>
        <input type="hidden" name="date" value={date} />
        <label>{dayLabel(date)} 근무자<select name="entryId" defaultValue={selected?.id ?? ""} required>
          <option value="" disabled>근무자를 선택하세요</option>
          {data.duties.map(d => <option key={d.id} value={d.id}>{d.shift} · {d.user.name}</option>)}
        </select></label>
        <button className="button primary">대체 후보 찾기</button>
      </form> : <p className="empty-state">이 날짜에 확정된 근무가 없습니다.</p>}
    </section>
    {selected && <section className="card table-card">
      <div className="card-header"><div><h2>{selected.user.name} · {selected.shift} 대체 후보</h2>
        <p>휴가·휴식·필요 인원을 확인한 뒤 희망 OFF가 없는 사람, 이번 달 근무일이 적은 사람 순으로 표시합니다.</p></div></div>
      {data.candidates.length > 0 ? <div className="table-wrap"><table className="data-table">
        <thead><tr><th>후보</th><th>이번 달 기존 근무</th><th>당일 희망 OFF</th><th>대체 요청</th></tr></thead>
        <tbody>{data.candidates.map(c => <tr key={c.userId}><th scope="row">{c.name}</th><td>{c.workDays}일</td><td>{c.requestedOff ? "신청함" : "없음"}</td>
          <td><form action={requestEmergencyCoverAction}><input type="hidden" name="entryId" value={selected.id} /><input type="hidden" name="shift" value={selected.shift} /><input type="hidden" name="date" value={date} />
            <button className="button secondary" name="targetId" value={c.userId} aria-label={c.name + "에게 대체 요청"}>요청 보내기</button></form></td></tr>)}</tbody>
      </table></div> : <p className="empty-state">{data.pending ? "해당 근무자의 변동 요청이 진행 중입니다. 수락 또는 거절 결과를 확인하세요." : "검증을 통과한 병동 내 대체 후보가 없습니다. 지원 인력 또는 인력 조정을 병동 책임자와 협의하세요."}</p>}
      {!data.candidates.length && !data.pending && !data.escalated && <form action={requestEmergencyCoverAction}>
        <input type="hidden" name="entryId" value={selected.id} /><input type="hidden" name="shift" value={selected.shift} /><input type="hidden" name="date" value={date} />
        <button className="button secondary" name="intent" value="escalate">미충원 기록</button>
      </form>}
    </section>}
    {data.escalations.length > 0 && <section className="card"><div className="card-header"><h2>이 날짜의 미충원 보고 이력</h2></div>
      <ul>{data.escalations.map(e => <li key={e.id}>{e.note} · 기록자 {e.changedBy.name}</li>)}</ul>
    </section>}
  </>;
}
