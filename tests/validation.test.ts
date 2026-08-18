import assert from "node:assert/strict";
import test from "node:test";
import { formInt, formIntInRange, formText, isValidDate, isValidMonth } from "../lib/validation";

test("월과 날짜는 실제 달력 값만 허용한다", () => {
  assert.equal(isValidMonth("2026-08"), true);
  assert.equal(isValidMonth("2026-13"), false);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2026-08-32"), false);
});

test("폼 문자열 길이와 정수 범위를 서버에서 제한한다", () => {
  const form = new FormData();
  form.set("short", "  가상 메모  ");
  form.set("long", "123456");
  form.set("id", "42");
  form.set("negative", "-1");
  form.set("count", "6");
  assert.equal(formText(form, "short", 20), "가상 메모");
  assert.equal(formText(form, "long", 5), "");
  assert.equal(formInt(form, "id"), 42);
  assert.equal(formInt(form, "negative"), null);
  assert.equal(formIntInRange(form, "count", 0, 5), null);
});
