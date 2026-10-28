export type Role = "HEAD_NURSE" | "NURSE";
export type RequestStatus = "REQUESTED" | "APPROVED" | "REJECTED";
export type VacationType = "ANNUAL" | "VACATION" | "EDUCATION" | "OTHER";
export type ScheduleStatus = "REQUEST" | "DRAFT" | "REVIEW" | "CONFIRMED";
export type ShiftType = "D" | "E" | "N" | "O";
export type ShiftChangeType = "SWAP" | "COVER";
export type ShiftChangeStatus = "OPEN" | "PENDING_TARGET" | "PENDING_HEAD" | "APPROVED" | "REJECTED" | "CANCELLED";
export type PatientStatus = "ADMITTED" | "DISCHARGED" | "TRANSFERRED";
export type HandoffStatus = "NOT_STARTED" | "IN_PROGRESS" | "DELIVERED" | "CONFIRMED";
export type CareShift = "D" | "E" | "N";

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
export type ScheduleDto = { id: number; wardId: number; month: string; status: ScheduleStatus; revision?: number; generationReport?: GenerationReportDto | null; proposal?: ScheduleProposalDto | null; entries: ScheduleEntryDto[]; requirements?: ShiftRequirementDto[]; changeLogs?: ChangeLogDto[] };
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

export type PatientDto = {
  id: number;
  wardId: number;
  patientCode: string;
  room: string;
  displayName: string;
  status: PatientStatus;
  warningTags: string[];
  admittedAt: string;
  dischargedAt: string | null;
};
export type PatientAssignmentDto = {
  id: number;
  wardId: number;
  patientId: number;
  nurseId: number;
  date: string;
  shift: CareShift;
  patient: PatientDto;
  nurse?: NamedUserDto;
};
export type HandoffContentDto = {
  currentStatus?: string;
  cautions?: string;
  tasks?: string;
  pendingTasks?: string;
  memo?: string;
};
export type HandoffDto = {
  id: number;
  patientId: number;
  fromAssignmentId: number;
  toAssignmentId: number;
  fromNurseId: number;
  toNurseId: number;
  fromDate: string;
  fromShift: CareShift;
  toDate: string;
  toShift: CareShift;
  status: HandoffStatus;
  content: HandoffContentDto;
  confirmedAt: string | null;
  updatedAt: string;
  patient: PatientDto;
  fromNurse: NamedUserDto;
  toNurse: NamedUserDto;
  confirmation?: { id: number; confirmedAt: string; confirmedBy?: NamedUserDto } | null;
};

export type HeadDashboardView = { nurses: Array<{ id: number }>; offRequests: Array<{ userId: number; date: string }>; vacations: VacationRequestDto[]; schedule: ScheduleDto | null; patients: Array<{ id: number }>; todayEntries: Array<{ shift: ShiftType | null }>; todayHandoffs: HandoffDto[]; todayUnavailableUserIds: number[] };
export type HeadNursesView = { nurses: NurseDto[] };
export type HeadRequestsView = { requests: Array<OffRequestDto & { user: NamedUserDto }> };
export type HeadVacationsView = { vacations: Array<VacationRequestDto & { user: NamedUserDto }> };
export type WorkShift = "D" | "E" | "N";
export type FairnessMetric = {
  userId: number; name: string; night: number; weekend: number;
  availableDays: number; availableWeekendDays: number; nightCapacity: number;
  expectedNight: number; expectedWeekend: number;
  requested: number; honored: number; missed: number; pending: number;
  nightBurden: number; weekendBurden: number; offMissedBurden: number;
};
export type FairnessHistoryDto = { userId: number; nightBurden: number; weekendBurden: number; offMissedBurden: number };
export type RequestOutcome = { id?: number; userId: number; date: string; status: string; outcome: "HONORED" | "MISSED" | "PENDING" };
export type FairnessDto = { metrics: FairnessMetric[]; requests: RequestOutcome[] };
export type RosterValidationDto = {
  issues: Array<{ key: string; code: string; userId?: number; date?: string; message: string }>;
  shortages: Array<{ date: string; shift: WorkShift; shortage: number }>;
  unassigned: Array<{ userId: number; date: string }>;
  unknownBoundaries: Array<{ side: "previous" | "next"; userId: number; date: string }>;
  valid: boolean;
};
export type ShortageCandidatesDto = { date: string; shift: WorkShift; shortage: number; candidates: Array<{ userId: number; reasons: string[] }> };
export type GeneratedAssignmentDto = { userId: number; date: string; shift: ShiftType };
export type GenerationReportDto = {
  assignments: GeneratedAssignmentDto[];
  warnings: ShortageCandidatesDto[];
  relaxedConstraints: number;
  unfulfilledRequestedOff: number;
  repair: { attempts: number; elapsedMs: number; shortagesBefore: number; shortagesAfter: number; changes: Array<{ userId: number; date: string; beforeShift: ShiftType; afterShift: ShiftType }>; status: "complete" | "limit" | "unresolved" };
};
export type ScheduleProposalDto = { assignments: GeneratedAssignmentDto[]; report: GenerationReportDto; baseRevision: number };
export type HeadScheduleView = {
  schedule: (ScheduleDto & { requirements: ShiftRequirementDto[]; changeLogs: ChangeLogDto[] }) | null;
  nurses: Array<NamedUserDto & { active?: boolean }>;
  allNurses: NamedUserDto[];
  offRequests: Array<{ userId: number; date: string; status?: RequestStatus }>;
  vacations: Array<{ userId: number; startDate: string; endDate: string }>;
  validation: RosterValidationDto | null;
  shortageCandidates: ShortageCandidatesDto[];
  fairness: FairnessDto;
  fairnessHistory: FairnessHistoryDto[];
  vacationDates: Array<{ userId: number; date: string }>;
  proposalChanges: Array<GeneratedAssignmentDto & { beforeShift: ShiftType | null }>;
  generationReport: GenerationReportDto | null;
  proposal: ScheduleProposalDto | null;
};
export type HeadShiftChangesView = { reviewItems: Array<{ request: ShiftChangeDto & { schedule: { id: number; month: string; status: ScheduleStatus } }; warnings: string[] }>; history: ShiftChangeDto[] };
export type HeadPatientAssignmentsView = { date: string; shift: CareShift; patients: PatientDto[]; nurses: NamedUserDto[]; assignments: PatientAssignmentDto[] };
export type HeadHandoffsView = { date: string; handoffs: HandoffDto[] };
export type NurseHomeView = { offRequests: OffRequestDto[]; vacations: VacationRequestDto[]; schedule: ScheduleDto | null; todayDuty: ScheduleEntryDto | null; assignments: PatientAssignmentDto[]; outgoing: HandoffDto[]; incoming: HandoffDto[] };
export type NurseOffView = { requests: OffRequestDto[] };
export type NurseVacationsView = { vacations: VacationRequestDto[] };
export type NurseScheduleView = { schedule: ScheduleDto | null; nurses: NamedUserDto[]; fairness: FairnessDto | null; fairnessHistory: FairnessHistoryDto[]; originalRequests: RequestOutcome[] };
export type NurseShiftChangesView = { futureEntries: ScheduleEntryDto[]; nurses: NamedUserDto[]; relatedRequests: ShiftChangeDto[]; openRequests: ShiftChangeDto[] };
export type NursePatientAssignmentsView = { date: string; shift: CareShift; assignments: PatientAssignmentDto[] };
export type NurseHandoffsView = { date: string; outgoing: HandoffDto[]; incoming: HandoffDto[] };

export const DEMO_ACCOUNTS = [
  { role: "수간호사", name: "관리자", employeeNumber: "H001" },
  { role: "일반 간호사", name: "김민지", employeeNumber: "N001" },
] as const;
