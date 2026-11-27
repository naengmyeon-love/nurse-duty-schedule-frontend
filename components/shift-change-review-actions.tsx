"use client";

import { reviewShiftChangeAction } from "@/app/actions";

export function ShiftChangeReviewActions({ id, warnings }: { id: number; warnings: string[] }) {
  return (
    <div className="review-action-grid">
      <form action={reviewShiftChangeAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="approve" />
        <label>
          승인 메모
          <input name="reviewNote" maxLength={200} placeholder="가상 내용만 입력" />
        </label>
        <button className="button confirm" type="submit" disabled={warnings.length > 0}>{warnings.length ? "필수 조건 충돌" : "최종 승인"}</button>
      </form>
      <form action={reviewShiftChangeAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="reject" />
        <label>
          반려 사유
          <input name="reviewNote" maxLength={200} placeholder="가상 내용만 입력" />
        </label>
        <button className="button reject" type="submit">반려</button>
      </form>
    </div>
  );
}
