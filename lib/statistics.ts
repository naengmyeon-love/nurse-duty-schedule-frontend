import type { ShiftType } from "@/lib/domain";

export type ShiftCounts = Record<ShiftType, number>;

export function countShifts(shifts: Array<ShiftType | null>): ShiftCounts {
  return shifts.reduce<ShiftCounts>(
    (counts, shift) => {
      if (shift) counts[shift] += 1;
      return counts;
    },
    { D: 0, E: 0, N: 0, O: 0 },
  );
}

export function staffingShortage(
  actual: Pick<ShiftCounts, "D" | "E" | "N">,
  required: { dayCount: number; eveningCount: number; nightCount: number },
) {
  return {
    D: Math.max(0, required.dayCount - actual.D),
    E: Math.max(0, required.eveningCount - actual.E),
    N: Math.max(0, required.nightCount - actual.N),
  };
}
