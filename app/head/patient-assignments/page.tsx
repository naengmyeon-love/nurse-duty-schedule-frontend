import { BedSingle, CircleAlert, UserRoundCheck, Users } from "lucide-react";
import {
  savePatientAction,
  savePatientAssignmentsAction,
  updatePatientStatusAction,
} from "@/app/actions";
import { CareContextPicker } from "@/components/care-context-picker";
import { PageHeader } from "@/components/page-header";
import { PatientStatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, dayLabel } from "@/lib/date";
import type { CareShift, HeadPatientAssignmentsView } from "@/lib/domain";
import { isValidDate } from "@/lib/validation";

export const metadata = { title: "환자배정" };

export default async function HeadPatientAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; shift?: string }>;
}) {
  await requireUser("HEAD_NURSE");
  const query = await searchParams;
  const date = query.date && isValidDate(query.date) ? query.date : currentDateInKorea();
  const shift = (["D", "E", "N"].includes(query.shift ?? "") ? query.shift : "D") as CareShift;
  const { patients, nurses, assignments } = await getView<HeadPatientAssignmentsView>(
    "head-patient-assignments",
    { date, shift },
  );
  const activePatients = patients.filter((patient) => patient.status === "ADMITTED");
  const inactivePatients = patients.filter((patient) => patient.status !== "ADMITTED");
  const assignmentByPatient = new Map(assignments.map((item) => [item.patientId, item]));
  const assignedCount = activePatients.filter((patient) => assignmentByPatient.has(patient.id)).length;
  const countsByNurse = new Map<number, number>();
  assignments.forEach((item) => countsByNurse.set(item.nurseId, (countsByNurse.get(item.nurseId) ?? 0) + 1));

  return (
    <>
      <PageHeader
        eyebrow="PATIENT ASSIGNMENT"
        title={`${dayLabel(date)} ${shift} 근무 환자배정`}
        description="환자는 근무조마다 새로 배정되며 다른 근무조의 담당자와 연결되지 않습니다."
        action={<CareContextPicker date={date} shift={shift} path="/head/patient-assignments" />}
      />

      <section className="metric-grid care-metrics">
        <article className="metric-card"><span className="metric-icon blue"><BedSingle /></span><div><small>입원 환자</small><strong>{activePatients.length}<em>명</em></strong><p>현재 배정 대상</p></div></article>
        <article className="metric-card"><span className="metric-icon mint"><Users /></span><div><small>{shift} 출근</small><strong>{nurses.length}<em>명</em></strong><p>근무표 기준</p></div></article>
        <article className="metric-card"><span className="metric-icon violet"><UserRoundCheck /></span><div><small>배정 완료</small><strong>{assignedCount}<em>명</em></strong><p>간호사 지정 완료</p></div></article>
        <article className="metric-card"><span className="metric-icon amber"><CircleAlert /></span><div><small>미배정</small><strong>{activePatients.length - assignedCount}<em>명</em></strong><p>담당자 확인 필요</p></div></article>
      </section>

      {!nurses.length && (
        <div className="alert warning">
          <CircleAlert size={18} />
          <span>선택한 날짜와 근무조에 배정된 출근 간호사가 없습니다. 먼저 듀티표를 확인하세요.</span>
        </div>
      )}

      <section className="card assignment-board">
        <div className="card-header">
          <div><p className="eyebrow">ASSIGNMENT BOARD</p><h2>환자별 담당 간호사</h2><p>미배정을 선택하면 기존 배정이 해제됩니다.</p></div>
        </div>
        <form action={savePatientAssignmentsAction}>
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="shift" value={shift} />
          <div className="assignment-grid">
            {activePatients.map((patient) => {
              const assigned = assignmentByPatient.get(patient.id);
              return (
                <article className="assignment-card" key={patient.id}>
                  <div className="patient-title">
                    <span className="room-number">{patient.room}호</span>
                    <div><strong>{patient.displayName}</strong><small>{patient.patientCode}</small></div>
                  </div>
                  <div className="tag-list">
                    {patient.warningTags.map((tag) => <span className="warning-tag" key={tag}>{tag}</span>)}
                    {!patient.warningTags.length && <span className="muted-tag">주의 태그 없음</span>}
                  </div>
                  <label>
                    <span>담당 간호사</span>
                    <select name={`patient-${patient.id}`} defaultValue={assigned?.nurseId ?? 0} disabled={!nurses.length}>
                      <option value="0">미배정</option>
                      {nurses.map((nurse) => (
                        <option value={nurse.id} key={nurse.id}>
                          {nurse.name} · 현재 {countsByNurse.get(nurse.id) ?? 0}명
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              );
            })}
            {!activePatients.length && <div className="empty-state">현재 입원 중인 환자가 없습니다.</div>}
          </div>
          {!!activePatients.length && (
            <div className="form-footer">
              <span>{date} · {shift} 근무조 배정만 변경됩니다.</span>
              <button className="button primary" type="submit" disabled={!nurses.length}>환자배정 저장</button>
            </div>
          )}
        </form>
      </section>

      <section className="card patient-admin">
        <div className="card-header">
          <div><p className="eyebrow">PATIENT LIST</p><h2>환자 입원·이동 관리</h2><p>표시 이름과 최소 정보만 저장하며 병실을 바꿔도 환자 ID는 유지됩니다.</p></div>
        </div>
        <form className="patient-create-form" action={savePatientAction}>
          <label><span>환자 ID</span><input name="patientCode" placeholder="P007" required /></label>
          <label><span>병실</span><input name="room" placeholder="507" required /></label>
          <label><span>표시 이름</span><input name="displayName" placeholder="홍○○" required /></label>
          <label className="grow"><span>주의 태그</span><input name="warningTags" placeholder="낙상주의, 관찰필요" /></label>
          <button className="button primary" type="submit">신규 입원 등록</button>
        </form>

        <div className="patient-management-list">
          {patients.map((patient) => (
            <article className="patient-management-row" key={patient.id}>
              <form action={savePatientAction}>
                <input type="hidden" name="id" value={patient.id} />
                <label><span>환자 ID</span><input name="patientCode" defaultValue={patient.patientCode} required /></label>
                <label><span>병실</span><input name="room" defaultValue={patient.room} required /></label>
                <label><span>표시 이름</span><input name="displayName" defaultValue={patient.displayName} required /></label>
                <label className="grow"><span>주의 태그</span><input name="warningTags" defaultValue={patient.warningTags.join(", ")} /></label>
                <button className="button secondary" type="submit">정보 저장</button>
              </form>
              <div className="patient-status-actions">
                <PatientStatusBadge status={patient.status} />
                <form action={updatePatientStatusAction}>
                  <input type="hidden" name="id" value={patient.id} />
                  {patient.status !== "ADMITTED" ? (
                    <button className="button tiny approve" name="status" value="ADMITTED">재입원</button>
                  ) : (
                    <>
                      <button className="button tiny reject" name="status" value="DISCHARGED">퇴원</button>
                      <button className="button tiny secondary" name="status" value="TRANSFERRED">전동</button>
                    </>
                  )}
                </form>
              </div>
            </article>
          ))}
          {!patients.length && <div className="empty-state">등록된 환자가 없습니다.</div>}
        </div>
        {!!inactivePatients.length && <p className="form-help">퇴원·전동 환자는 이후 근무조의 배정 대상에서 자동 제외됩니다.</p>}
      </section>
    </>
  );
}
