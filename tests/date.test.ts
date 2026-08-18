import assert from "node:assert/strict";
import test from "node:test";
import { dateRange, daysInMonth, overlapDays } from "../lib/date";

test("윤년을 포함한 월 일수를 계산한다", () => {
  assert.equal(daysInMonth("2028-02"), 29);
  assert.equal(daysInMonth("2027-02"), 28);
});

test("월 경계에 걸친 휴가 중 해당 월 일수만 계산한다", () => {
  assert.deepEqual(overlapDays("2026-08-30", "2026-09-02", "2026-09"), ["2026-09-01", "2026-09-02"]);
  assert.equal(dateRange("2026-08-30", "2026-09-02").length, 4);
});
