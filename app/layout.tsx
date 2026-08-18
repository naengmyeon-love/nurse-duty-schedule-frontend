import type { Metadata } from "next";
import { DemoNotice } from "@/components/demo-notice";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "듀티메이트", template: "%s | 듀티메이트" },
  description: "가상 간호사 데이터로 희망 OFF, 휴가, 월간 듀티표 기능을 체험하는 공개 데모",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><DemoNotice />{children}</body></html>;
}
