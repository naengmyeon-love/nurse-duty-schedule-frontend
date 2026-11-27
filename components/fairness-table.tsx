import type { FairnessMetric } from "@/lib/domain";

type History = { userId: number; nightBurden: number; weekendBurden: number; offMissedBurden: number };
const decimal = (value: number) => Number.isFinite(value) ? value.toFixed(1) : "—";
const signed = (value: number) => `${value > 0 ? "+" : ""}${decimal(value)}`;

export function FairnessTable({ metrics, history, ownOnly = false }: { metrics: FairnessMetric[]; history: History[]; ownOnly?: boolean }) {
  const prior = new Map(history.map((item) => [item.userId, item]));
  return <section className="card table-card">
    <div className="card-header"><div><h2>{ownOnly ? "내 부담과 희망 OFF" : "개인별 부담과 희망 OFF"}</h2><p>주말은 토·일입니다. 신청 승인 여부와 실제 OFF 반영 여부를 따로 집계합니다.</p></div></div>
    <div className="table-wrap"><table className="data-table"><thead><tr><th>간호사</th><th>Night / 산정 상한</th><th>주말근무</th><th>가용일 / 주말</th><th>희망 OFF<br/>신청 · 반영 · 미반영 · 미배정</th><th>이번 달 기대 부담<br/>Night · 주말</th><th>이전 6개월 보정<br/>Night · 주말 · OFF</th></tr></thead><tbody>
      {metrics.map((m) => { const h = prior.get(m.userId); return <tr key={m.userId}><td><strong>{m.name}</strong></td><td>{m.night} / {m.nightCapacity}</td><td>{m.weekend}</td><td>{m.availableDays} / {m.availableWeekendDays}</td><td>{m.requested} · {m.honored} · {m.missed} · {m.pending}</td><td>{decimal(m.expectedNight)} · {decimal(m.expectedWeekend)}</td><td>{h ? `${signed(h.nightBurden)} · ${signed(h.weekendBurden)} · ${decimal(h.offMissedBurden)}` : "기록 없음"}</td></tr>; })}
      {!metrics.length && <tr><td colSpan={7}>집계할 간호사가 없습니다.</td></tr>}
    </tbody></table></div>
    <p className="form-help" style={{ padding: "0 22px 12px" }}>임시 공정성 기준: Night는 개인 야간 한도와 가용일, 주말은 가용 주말 수로 기대 부담을 나눕니다. 이전 6개월 확정 기록의 실제−기대 차이가 양수이면 다음 배정에서 부담을 낮춥니다. OFF는 월별 미반영/신청 비율을 누적합니다. 동일 횟수를 강제하지 않으며, 가용일 가중치는 모든 조합의 실제 배정 가능성을 뜻하지 않습니다. 이력 저장 도입 이전의 확정표는 현재 가용조건과 남아 있는 신청으로 추정합니다.</p>
  </section>;
}
