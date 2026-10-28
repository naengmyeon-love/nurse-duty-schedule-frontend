"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { generateScheduleAction } from "@/app/actions";

function ConfirmationControls({ confirmed, onCancel }: { confirmed: boolean; onCancel: () => void }) {
  const { pending } = useFormStatus();
  return <div className="schedule-toolbar-actions">
    <button className="button auto-generate" type="submit" disabled={pending}>
      {pending ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
      {pending ? "자동 배정 중…" : confirmed ? "재생성안 생성 실행" : "자동 생성 실행"}
    </button>
    <button className="button secondary" type="button" disabled={pending} onClick={onCancel}>취소</button>
  </div>;
}

export function AutoGenerateButton({ scheduleId, confirmed }: { scheduleId: number; confirmed: boolean }) {
  const [reviewing, setReviewing] = useState(false);
  const messageId = useId();
  const message = confirmed
    ? "확정표를 유지하고 재생성안을 만듭니다. 변경 내용을 검토한 뒤 적용할 수 있습니다."
    : "현재 초안의 배정을 자동 생성 결과로 대체합니다. 기존 배정과 달라질 수 있으며 변경 기록이 남습니다.";
  return <form action={generateScheduleAction} aria-describedby={reviewing ? messageId : undefined}>
    <input type="hidden" name="scheduleId" value={scheduleId} />
    {reviewing ? <div className="constraint-box">
      <p id={messageId}>{message}</p>
      <ConfirmationControls confirmed={confirmed} onCancel={() => setReviewing(false)} />
    </div> : <button className="button auto-generate" type="button" onClick={() => setReviewing(true)}><Sparkles size={17}/>{confirmed ? "재생성안 만들기" : "자동 듀티 생성"}</button>}
  </form>;
}
