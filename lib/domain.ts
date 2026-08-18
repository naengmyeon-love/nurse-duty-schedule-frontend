export type Role = "HEAD_NURSE" | "NURSE";
export type RequestStatus = "REQUESTED" | "APPROVED" | "REJECTED";
export type VacationType = "ANNUAL" | "VACATION" | "EDUCATION" | "OTHER";
export type ScheduleStatus = "REQUEST" | "DRAFT" | "REVIEW" | "CONFIRMED";
export type ShiftType = "D" | "E" | "N" | "O";
export type ShiftChangeType = "SWAP" | "COVER";
export type ShiftChangeStatus = "OPEN" | "PENDING_TARGET" | "PENDING_HEAD" | "APPROVED" | "REJECTED" | "CANCELLED";

export type WardDto = { id: number; name: string };
export type CurrentUserDto = { id: number; name: string; role: Role; wardId: number; ward: WardDto };
export type NurseDto = {
  id: number;
  name: string;
  employeeNumber: string;
  active: boolean;
  experienceLevel: number;
  maxNightShifts: number;
  maxConsecutive: number;
};
export type NamedUserDto = { id: number; name: string };
export type ScheduleEntryDto = { id: number; scheduleId: number; userId: number; date: string; shift: ShiftType | null };
export type ShiftRequirementDto = { id: number; scheduleId: number; date: string; dayCount: number; eveningCount: number; nightCount: number };
export type OffRequestDto = { id: number; wardId: number; userId: number; date: string; memo: string | null; status: RequestStatus; user?: NamedUserDto };
export type VacationRequestDto = { id: number; wardId: number; userId: number; startDate: string; endDate: string; type: VacationType; memo: string | null; status: RequestStatus; user?: NamedUserDto };
export type ChangeLogDto = { id: number; date: string | null; beforeShift: ShiftType | null; afterShift: ShiftType | null; action: string; note: string | null; changedBy: { name: string } };
export type ScheduleDto = { id: number; wardId: number; month: string; status: ScheduleStatus; entries: ScheduleEntryDto[]; requirements?: ShiftRequirementDto[]; changeLogs?: ChangeLogDto[] };
export type ShiftChangeDto = {
  id: number;
  wardId: number;
  scheduleId: number;
  requesterId: number;
  targetUserId: number | null;
  type: ShiftChangeType;
  status: ShiftChangeStatus;
  date: string;
  requesterShift: ShiftType;
  targetShift: ShiftType | null;
  reason: string | null;
  reviewNote: string | null;
  requester: NamedUserDto;
  targetUser?: NamedUserDto | null;
  reviewedBy?: NamedUserDto | null;
  schedule?: { id: number; month: string; status: ScheduleStatus };
};

export type HeadDashboardView = { nurses: Array<{ id: number }>; offRequests: Array<{ userId: number; date: string }>; vacations: VacationRequestDto[]; schedule: ScheduleDto | null };
export type HeadNursesView = { nurses: NurseDto[] };
export type HeadRequestsView = { requests: Array<OffRequestDto & { user: NamedUserDto }> };
export type HeadVacationsView = { vacations: Array<VacationRequestDto & { user: NamedUserDto }> };
export type HeadScheduleView = { schedule: (ScheduleDto & { requirements: ShiftRequirementDto[]; changeLogs: ChangeLogDto[] }) | null; nurses: NamedUserDto[]; offRequests: Array<{ userId: number; date: string }>; vacations: Array<{ userId: number; startDate: string; endDate: string }> };
export type HeadShiftChangesView = { reviewItems: Array<{ request: ShiftChangeDto & { schedule: { id: number; month: string; status: ScheduleStatus } }; warnings: string[] }>; history: ShiftChangeDto[] };
export type NurseHomeView = { offRequests: OffRequestDto[]; vacations: VacationRequestDto[]; schedule: ScheduleDto | null };
export type NurseOffView = { requests: OffRequestDto[] };
export type NurseVacationsView = { vacations: VacationRequestDto[] };
export type NurseScheduleView = { schedule: ScheduleDto | null; nurses: NamedUserDto[] };
export type NurseShiftChangesView = { futureEntries: ScheduleEntryDto[]; nurses: NamedUserDto[]; relatedRequests: ShiftChangeDto[]; openRequests: ShiftChangeDto[] };

export const DEMO_ACCOUNTS = [
  { role: "수간호사", name: "관리자", employeeNumber: "H001" },
  { role: "일반 간호사", name: "김민지", employeeNumber: "N001" },
] as const;
