import { Plus } from "lucide-react";
import { deleteVacationAction, saveVacationAction } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { RequestBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import type { NurseVacationsView } from "@/lib/domain";
import { vacationTypeLabel } from "@/lib/labels";

export const metadata = { title: "휴가·연차 신청" };

export default async function NurseVacationsPage() {
  await requireUser("NURSE"); const { vacations } = await getView<NurseVacationsView>("nurse-vacations");
  return <><PageHeader eyebrow="VACATION" title="휴가·연차 신청" description="휴가 종류와 기간을 구분해 신청하고 진행 상태를 확인하세요." />
    <section className="card"><div className="card-header"><div><h2>새 휴가 신청</h2><p>종료일은 시작일보다 빠를 수 없습니다.</p></div><Plus/></div><form className="inline-form vacation-form" action={saveVacationAction}><label>휴가 종류<select name="type" defaultValue="ANNUAL"><option value="ANNUAL">연차</option><option value="VACATION">휴가</option><option value="EDUCATION">교육</option><option value="OTHER">기타</option></select></label><label>시작일<input name="startDate" type="date" required/></label><label>종료일<input name="endDate" type="date" required/></label><label className="grow">메모<input name="memo" maxLength={200} placeholder="가상 내용만 입력"/></label><button className="button primary">신청하기</button></form></section>
    <section className="card table-card"><div className="card-header"><div><h2>내 신청 내역</h2><p>수정하면 상태가 다시 ‘신청’으로 변경됩니다.</p></div></div><div className="vacation-list">{vacations.map((v) => <form className="vacation-edit-card" action={saveVacationAction} key={v.id}><input type="hidden" name="id" value={v.id}/><div className="vacation-card-title"><strong>{vacationTypeLabel[v.type]}</strong><RequestBadge status={v.status}/></div><label>종류<select name="type" defaultValue={v.type}><option value="ANNUAL">연차</option><option value="VACATION">휴가</option><option value="EDUCATION">교육</option><option value="OTHER">기타</option></select></label><label>시작<input name="startDate" type="date" defaultValue={v.startDate}/></label><label>종료<input name="endDate" type="date" defaultValue={v.endDate}/></label><label className="grow">메모<input name="memo" maxLength={200} defaultValue={v.memo ?? ""}/></label><div className="row-actions"><button className="button tiny secondary">수정 저장</button><button className="button tiny ghost danger" formAction={deleteVacationAction}>취소</button></div></form>)}{!vacations.length && <div className="empty-state">아직 휴가 신청 내역이 없습니다.</div>}</div></section>
  </>;
}
