import assert from "node:assert/strict";
import test from "node:test";
import { currentMonth, dateRange, daysInMonth, overlapDays } from "../lib/date";

test("윤년을 포함한 월 일수를 계산한다", () => {
  assert.equal(daysInMonth("2028-02"), 29);
  assert.equal(daysInMonth("2027-02"), 28);
});

test("월 경계에 걸친 휴가 중 해당 월 일수만 계산한다", () => {
  assert.deepEqual(overlapDays("2026-08-30", "2026-09-02", "2026-09"), ["2026-09-01", "2026-09-02"]);
  assert.equal(dateRange("2026-08-30", "2026-09-02").length, 4);
});

test("서버 시간대와 관계없이 한국 자정의 월·연도 경계를 선택한다", () => {
  assert.equal(currentMonth(new Date("2026-10-31T14:59:59Z")), "2026-10");
  assert.equal(currentMonth(new Date("2026-10-31T15:00:00Z")), "2026-11");
  assert.equal(currentMonth(new Date("2026-12-31T15:00:00Z")), "2027-01");
});
