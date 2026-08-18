import { Info, ShieldAlert } from "lucide-react";

export function DemoNotice() {
  return (
    <aside className="demo-notice" aria-label="공개 데모 안내">
      <span><Info size={16} aria-hidden="true" /> 공개 데모이며 모든 데이터는 가상 데이터이고 언제든 초기화될 수 있습니다.</span>
      <strong><ShieldAlert size={16} aria-hidden="true" /> 실제 개인정보를 입력하지 마세요.</strong>
    </aside>
  );
}
