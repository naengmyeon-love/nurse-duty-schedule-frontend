import { UserPlus } from "lucide-react";
import { saveNurseAction, toggleNurseAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import type { HeadNursesView } from "@/lib/domain";

export const metadata = { title: "간호사 관리" };

export default async function NursesPage() {
  await requireUser("HEAD_NURSE");
  const { nurses } = await getView<HeadNursesView>("head-nurses");
  return <>
    <PageHeader eyebrow="TEAM" title="간호사 관리" description={`병동 구성원 ${nurses.filter((n) => n.active).length}명이 근무 중입니다.`} />
    <section className="card"><div className="card-header"><div><h2>새 간호사 등록</h2><p>이름과 로그인에 사용할 일련번호를 입력하세요.</p></div><UserPlus /></div>
      <form className="inline-form nurse-form" action={saveNurseAction}><label>이름<input name="name" maxLength={40} placeholder="가상 이름" required /></label><label>일련번호<input name="employeeNumber" maxLength={20} pattern="[A-Za-z0-9_-]+" placeholder="예: N007" required /></label><label>경력 레벨<input name="experienceLevel" type="number" min="1" max="5" defaultValue="1" /></label><label>월 최대 N<input name="maxNightShifts" type="number" min="0" max="31" defaultValue="6" /></label><label>최대 연속근무<input name="maxConsecutive" type="number" min="1" max="31" defaultValue="6" /></label><button className="button primary" type="submit">등록</button></form>
    </section>
    <section className="card table-card"><div className="card-header"><div><h2>구성원 목록</h2><p>수정 후 저장하거나 근무 상태를 변경할 수 있습니다.</p></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>간호사</th><th>일련번호</th><th>경력</th><th>최대 N</th><th>최대 연속</th><th>상태</th><th></th></tr></thead><tbody>{nurses.map((nurse) => <tr key={nurse.id} className={!nurse.active ? "muted-row" : ""}><td colSpan={7}><form className="table-edit-form" action={saveNurseAction}><input type="hidden" name="id" value={nurse.id} /><input aria-label="이름" name="name" maxLength={40} defaultValue={nurse.name} required /><input aria-label="일련번호" name="employeeNumber" maxLength={20} pattern="[A-Za-z0-9_-]+" defaultValue={nurse.employeeNumber} required /><input aria-label="경력 레벨" name="experienceLevel" type="number" min="1" max="5" defaultValue={nurse.experienceLevel} /><input aria-label="최대 Night" name="maxNightShifts" type="number" min="0" max="31" defaultValue={nurse.maxNightShifts} /><input aria-label="최대 연속근무" name="maxConsecutive" type="number" min="1" max="31" defaultValue={nurse.maxConsecutive} /><span className={`badge ${nurse.active ? "active" : "inactive"}`}>{nurse.active ? "근무 중" : "비활성"}</span><div className="row-actions"><button className="button tiny secondary" type="submit">저장</button><button className="button tiny ghost" formAction={toggleNurseAction} type="submit">{nurse.active ? "비활성화" : "활성화"}</button></div></form></td></tr>)}</tbody></table></div>
    </section>
  </>;
}
