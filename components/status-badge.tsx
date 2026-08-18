import type { RequestStatus, ScheduleStatus, ShiftChangeStatus } from "@/lib/domain";
import { requestStatusLabel, scheduleStatusLabel, shiftChangeStatusLabel } from "@/lib/labels";

export function RequestBadge({ status }: { status: RequestStatus }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{requestStatusLabel[status]}</span>;
}

export function ScheduleBadge({ status }: { status: ScheduleStatus }) {
  return <span className={`badge schedule-${status.toLowerCase()}`}>{scheduleStatusLabel[status]}</span>;
}

export function ShiftChangeBadge({ status }: { status: ShiftChangeStatus }) {
  return <span className={`badge change-${status.toLowerCase()}`}>{shiftChangeStatusLabel[status]}</span>;
}
