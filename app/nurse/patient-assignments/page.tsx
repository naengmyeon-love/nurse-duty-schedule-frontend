import { BedSingle, ShieldAlert } from "lucide-react";
import { CareContextPicker } from "@/components/care-context-picker";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentDateInKorea, dayLabel } from "@/lib/date";
import type { CareShift, NursePatientAssignmentsView } from "@/lib/domain";
import { isValidDate } from "@/lib/validation";

export const metadata = { title: "내 담당 환자" };

export default async function NursePatientAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; shift?: string }>;
}) {
  await requireUser("NURSE");
  const query = await searchParams;
  const date = query.date && isValidDate(query.date) ? query.date : currentDateInKorea();
  const shift = (["D", "E", "N"].includes(query.shift ?? "") ? query.shift : "D") as CareShift;
  const { assignments } = await getView<NursePatientAssignmentsView>("nurse-patient-assignments", { date, shift });

  return (
    <>
      <PageHeader
        eyebrow="MY PATIENTS"
        title={dayLabel(date) + " " + shift + " 내 담당 환자"}
        description="환자 담당은 선택한 날짜와 근무조에만 적용됩니다."
        action={<CareContextPicker date={date} shift={shift} path="/nurse/patient-assignments" />}
      />
      <section className="patient-card-grid">
        {assignments.map(({ patient }) => (
          <article className="card patient-card" key={patient.id}>
            <div className="patient-title">
              <span className="room-number">{patient.room}호</span>
              <div><strong>{patient.displayName}</strong><small>{patient.patientCode}</small></div>
            </div>
            <div className="tag-list">
              {patient.warningTags.map((tag) => <span className="warning-tag" key={tag}><ShieldAlert size={12} />{tag}</span>)}
              {!patient.warningTags.length && <span className="muted-tag">주의 태그 없음</span>}
            </div>
          </article>
        ))}
        {!assignments.length && (
          <section className="card empty-large patient-empty">
            <span className="empty-icon"><BedSingle /></span>
            <h2>배정된 환자가 없습니다.</h2>
            <p>선택한 근무조에 근무하지 않거나 수간호사의 배정 전일 수 있습니다.</p>
          </section>
        )}
      </section>
    </>
  );
}
