import Link from "next/link";
import { redirect } from "next/navigation";
import { randomInt } from "node:crypto";
import { PageHeader } from "@/components/page-header";
import { getView } from "@/lib/backend";

type Score = { replacement: number | null; recovered: boolean; violations: number; shortage: number; changedCells: number; requestedOffLost: number };
type MonthlyScore = { confirmed: boolean; honored: number; requests: number; maxNightExcess: number; maxWeekendExcess: number };
type Total = { recovered: number; violations: number; shortage: number; changedCells: number; requestedOffLost: number };
type Evidence = { cases: number; totals: { firstFit: Total; recommended: Total }; monthly: { size: number; variant: number; rotation: MonthlyScore; dutymate: MonthlyScore }[] };
type Trial = {
  evidence: Evidence | null;
  seed: number; absence: { userId: number; date: string; shift: string }; contextDates: string[];
  candidates: { id: number; shifts: string[]; unavailable: boolean; requestedOff: boolean; nights: number; workDays: number }[];
  manual: Score | null; results: { firstFit: Score; recommended: Score } | null;
};

function ExperimentSummary({ evidence }: { evidence: Evidence }) {
  const { cases, totals, monthly } = evidence;
  return <details className="card table-card">
    <summary>월간 편성 {monthly.length}건과 결원 {cases}건의 비교 결과</summary>
    <div className="card-header"><div><h2>월간 편성</h2><p>10·20·40·80명 병동에서 같은 수요와 휴무 입력 두 세트를 사용했습니다. 고정 순환표는 D→E→N→O→O를 반복합니다.</p></div></div>
    <div className="table-wrap"><table className="data-table"><thead><tr><th>방식</th><th>확정 가능</th><th>희망 OFF 반영</th><th>개인 최대 야간 초과</th><th>개인 최대 주말 초과</th></tr></thead>
      <tbody>{(["rotation", "dutymate"] as const).map(key => {
        const rows = monthly.map(m => m[key]);
        return <tr key={key}><th scope="row">{key === "rotation" ? "고정 순환표" : "듀티메이트"}</th>
          <td>{rows.filter(r => r.confirmed).length}/{rows.length}건</td><td>{rows.reduce((n,r) => n + r.honored, 0)}/{rows.reduce((n,r) => n + r.requests, 0)}건</td>
          <td>{Math.max(...rows.map(r => r.maxNightExcess)).toFixed(2)}회</td><td>{Math.max(...rows.map(r => r.maxWeekendExcess)).toFixed(2)}회</td></tr>;
      })}</tbody></table></div>
    <p>개인별 야간 가능 횟수와 근무 가능한 주말 일수에 비례해 기대 배정을 계산하고, 실제 배정이 이를 가장 많이 초과한 값을 표시합니다.</p>
    <div className="card-header"><div><h2>결원 대응</h2><p>사례 1~{cases}를 두 방식으로 각각 평가했습니다. 5의 배수 사례는 당일 OFF 인력 전원이 승인 휴무입니다.</p></div></div>
    <div className="table-wrap"><table className="data-table"><thead><tr><th>방식</th><th>복구 성공</th><th>필수 위반</th><th>부족 인원 합계</th><th>변경 칸 합계</th><th>깨진 희망 OFF</th></tr></thead>
      <tbody>{(["firstFit", "recommended"] as const).map(key => <tr key={key}><th scope="row">{key === "firstFit" ? "명단순 첫 적격자" : "듀티메이트 추천"}</th>
        <td>{totals[key].recovered}/{cases}건</td><td>{totals[key].violations}건</td><td>{totals[key].shortage}명</td><td>{totals[key].changedCells}칸</td><td>{totals[key].requestedOffLost}건</td></tr>)}</tbody></table></div>
    <p>두 비교군은 가상 병동에서 실행한 규칙입니다. 실제 수간호사의 작성·검토 시간과 대체자의 수락 여부는 현장 측정 대상입니다.</p>
  </details>;
}

export const metadata = { title: "무작위 결원 비교 실험" };

export default async function TrialPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  if (q.draw === "1") redirect("/head/emergency/trial?seed=" + randomInt(1, 1_000_000));
  const seed = /^\d{1,9}$/.test(q.seed ?? "") ? q.seed! : "42";
  const data = await getView<Trial>("head-coverage-trial", { seed, choice: q.choice ?? "", reveal: q.reveal ?? "" });
  const { absence, candidates } = data;
  const scores: [string, Score][] = data.results ? [
    ...(data.manual ? [["직접 선택", data.manual] as [string, Score]] : []),
    ["명단순 첫 적격자", data.results.firstFit], ["듀티메이트 추천", data.results.recommended],
  ] : [];
  return <>
    <PageHeader title="무작위 결원 비교 실험" description="가상 병동의 확정 근무 한 건을 무작위로 비웁니다. 같은 사례 번호로 동일한 근무표와 결원을 재현할 수 있습니다."
      action={<Link className="button secondary" href="/head/emergency">결원 대응으로</Link>} />
    <section className="card">
      <div className="card-header"><div><h2>{absence.date} · {absence.shift} 근무 결원</h2><p>간호사 {absence.userId} 결근 · 사례 {seed} · 필요 인원 D 4명 / E 3명 / N 3명</p></div></div>
      <form className="inline-form"><label>사례 번호<input type="number" name="seed" min="0" max="999999999" defaultValue={seed} key={seed} required /></label>
        <button className="button secondary">사례 불러오기</button><button className="button secondary" name="draw" value="1" formNoValidate>무작위 추첨</button></form>
    </section>
    <section className="card table-card">
      <div className="card-header"><div><h2>당일 OFF 명단</h2><p>승인 휴무, 야간 다음 날 근무, E 다음 날 D를 금지합니다. 월 야간 한도는 7회, 연속근무는 최대 5일이며 인접 월 경계일은 OFF입니다.</p></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>간호사</th>{data.contextDates.map(d => <th key={d}>{d.slice(-2)}일{d === absence.date ? " (결원)" : ""}</th>)}<th>승인 휴무</th><th>희망 OFF</th><th>월 야간</th><th>월 근무</th></tr></thead>
        <tbody>{candidates.map(c => <tr key={c.id}><th scope="row">{c.id}번</th>{c.shifts.map((s,i) => <td key={i}>{s}</td>)}<td>{c.unavailable ? "승인" : "—"}</td><td>{c.requestedOff ? "희망" : "—"}</td><td>{c.nights}회</td><td>{c.workDays}일</td></tr>)}</tbody></table></div>
      <form className="inline-form"><input type="hidden" name="seed" value={seed} /><label>직접 선택<select name="choice" required defaultValue={data.manual ? String(data.manual.replacement ?? "none") : ""} key={seed}>
        <option value="" disabled>대체자를 선택하세요</option><option value="none">미충원 보고</option>{candidates.map(c => <option value={c.id} key={c.id}>간호사 {c.id}</option>)}</select></label>
        <button className="button primary">내 선택 비교</button>
        <Link className="button secondary" href={`?seed=${seed}&reveal=1`}>두 모형 결과 보기</Link>
      </form>
    </section>
    {data.results && <section className="card table-card"><div className="card-header"><div><h2>같은 결원에 대한 결과</h2>
      <p>명단순은 적격자 중 번호가 가장 이른 사람을 고릅니다. 추천은 희망 OFF 보존, 월 근무일 수, 번호 순으로 고릅니다. 두 모형 모두 후보가 수락한다고 가정합니다.</p></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr>{["방식", "대체자", "복구", "규칙 위반", "부족 인원", "변경 칸", "깨진 희망 OFF"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
        {scores.map(([label, s]) => <tr key={label}><th scope="row">{label}</th><td>{s.replacement ?? "없음"}</td><td>{s.recovered ? "성공" : "미해결"}</td><td>{s.violations}건</td><td>{s.shortage}명</td><td>{s.changedCells}칸</td><td>{s.requestedOffLost}건</td></tr>)}
      </tbody></table></div><p>복구는 결근자를 제외한 뒤 필수 규칙·인원·배정 검사를 모두 통과해야 성공입니다. 변경 칸에는 결근자 본인의 변경도 포함합니다.</p>
    </section>}
    {data.evidence && <ExperimentSummary evidence={data.evidence} />}
  </>;
}
