import type { HandoffStatus, PatientStatus, RequestStatus, ScheduleStatus, ShiftChangeStatus } from "@/lib/domain";
import { handoffStatusLabel, patientStatusLabel, requestStatusLabel, scheduleStatusLabel, shiftChangeStatusLabel } from "@/lib/labels";

export function RequestBadge({ status }: { status: RequestStatus }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{requestStatusLabel[status]}</span>;
}

export function ScheduleBadge({ status }: { status: ScheduleStatus }) {
  return <span className={`badge schedule-${status.toLowerCase()}`}>{scheduleStatusLabel[status]}</span>;
}

export function ShiftChangeBadge({ status }: { status: ShiftChangeStatus }) {
  return <span className={`badge change-${status.toLowerCase()}`}>{shiftChangeStatusLabel[status]}</span>;
}

export function HandoffBadge({ status }: { status: HandoffStatus }) {
  return <span className={`badge handoff-${status.toLowerCase()}`}>{handoffStatusLabel[status]}</span>;
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return <span className={`badge patient-${status.toLowerCase()}`}>{patientStatusLabel[status]}</span>;
}
