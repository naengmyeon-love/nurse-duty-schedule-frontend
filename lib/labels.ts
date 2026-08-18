import type { HandoffStatus, PatientStatus, RequestStatus, ScheduleStatus, ShiftChangeStatus, ShiftChangeType, ShiftType, VacationType } from "@/lib/domain";

export const requestStatusLabel: Record<RequestStatus, string> = {
  REQUESTED: "신청",
  APPROVED: "승인",
  REJECTED: "반려",
};

export const vacationTypeLabel: Record<VacationType, string> = {
  ANNUAL: "연차",
  VACATION: "휴가",
  EDUCATION: "교육",
  OTHER: "기타",
};

export const scheduleStatusLabel: Record<ScheduleStatus, string> = {
  REQUEST: "신청 기간",
  DRAFT: "작성 중",
  REVIEW: "최종 검토",
  CONFIRMED: "확정",
};

export const shiftLabel: Record<ShiftType, string> = {
  D: "D",
  E: "E",
  N: "N",
  O: "OFF",
};

export const shiftChangeTypeLabel: Record<ShiftChangeType, string> = {
  SWAP: "근무 교환",
  COVER: "대체근무",
};

export const shiftChangeStatusLabel: Record<ShiftChangeStatus, string> = {
  OPEN: "지원자 모집 중",
  PENDING_TARGET: "상대 수락 대기",
  PENDING_HEAD: "최종 승인 대기",
  APPROVED: "변경 완료",
  REJECTED: "반려·거절",
  CANCELLED: "취소",
};

export const handoffStatusLabel: Record<HandoffStatus, string> = {
  NOT_STARTED: "미작성",
  IN_PROGRESS: "작성 중",
  DELIVERED: "전달 완료",
  CONFIRMED: "확인 완료",
};

export const patientStatusLabel: Record<PatientStatus, string> = {
  ADMITTED: "입원",
  DISCHARGED: "퇴원",
  TRANSFERRED: "전동",
};
