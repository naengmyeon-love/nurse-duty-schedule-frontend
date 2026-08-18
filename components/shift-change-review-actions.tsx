"use client";

import { reviewShiftChangeAction } from "@/app/actions";

export function ShiftChangeReviewActions({ id, warnings }: { id: number; warnings: string[] }) {
  return (
    <div className="review-action-grid">
      <form
        action={reviewShiftChangeAction}
        onSubmit={(event) => {
          if (!warnings.length) return;
          const message = `다음 경고가 있습니다. 그래도 승인하시겠습니까?\n\n${warnings.join("\n")}`;
          if (!window.confirm(message)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="approve" />
        {warnings.length > 0 && <input type="hidden" name="force" value="1" />}
        <label>
          승인 메모
          <input name="reviewNote" maxLength={200} placeholder="가상 내용만 입력" />
        </label>
        <button className="button confirm" type="submit">최종 승인</button>
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
