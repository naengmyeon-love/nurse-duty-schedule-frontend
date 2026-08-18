"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom";
import { generateScheduleAction } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button auto-generate" type="submit" disabled={pending}>
    {pending ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
    {pending ? "자동 배정 중…" : "자동 듀티 생성"}
  </button>;
}

export function AutoGenerateButton({ scheduleId, confirmed }: { scheduleId: number; confirmed: boolean }) {
  const message = confirmed
    ? "확정된 듀티표를 자동 생성 결과로 덮어씁니다. 변경 이력은 자동으로 기록됩니다. 계속할까요?"
    : "현재 듀티표를 자동 생성 결과로 덮어씁니다. 계속할까요?";
  return <form action={generateScheduleAction} onSubmit={(event) => { if (!window.confirm(message)) event.preventDefault(); }}>
    <input type="hidden" name="scheduleId" value={scheduleId} />
    <SubmitButton />
  </form>;
}
