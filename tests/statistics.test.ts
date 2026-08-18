import assert from "node:assert/strict";
import test from "node:test";
import { countShifts, staffingShortage } from "../lib/statistics";

test("근무 타입별 횟수를 계산한다", () => {
  assert.deepEqual(countShifts(["D", "D", "E", "N", "O", null]), { D: 2, E: 1, N: 1, O: 1 });
});

test("필요 인원보다 부족한 근무만 경고한다", () => {
  assert.deepEqual(staffingShortage({ D: 5, E: 3, N: 2 }, { dayCount: 5, eveningCount: 4, nightCount: 3 }), { D: 0, E: 1, N: 1 });
});
