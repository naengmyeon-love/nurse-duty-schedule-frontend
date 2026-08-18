"use client";

import { RotateCcw } from "lucide-react";
import { resetDemoDataAction } from "@/app/actions";

export function DemoResetButton() {
  return (
    <form
      action={resetDemoDataAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "모든 희망 OFF·휴가·근무 교환 요청, 근무표와 변경 이력을 삭제하고 가상 데모 데이터로 복원합니다. 현재 로그인도 종료됩니다. 계속할까요?",
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <button className="button danger" type="submit"><RotateCcw size={16} /> 데모 데이터 초기화</button>
    </form>
  );
}
