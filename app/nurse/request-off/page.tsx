import { MonthPicker } from "@/components/month-picker";
import { OffCalendar } from "@/components/off-calendar";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getView } from "@/lib/backend";
import { currentMonth, monthLabel } from "@/lib/date";
import type { NurseOffView } from "@/lib/domain";
import { isValidMonth } from "@/lib/validation";

export const metadata = { title: "희망 OFF 신청" };

export default async function NurseOffPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireUser("NURSE"); const requestedMonth = (await searchParams).month; const month = requestedMonth && isValidMonth(requestedMonth) ? requestedMonth : currentMonth();
  const { requests } = await getView<NurseOffView>("nurse-off", { month });
  return <><PageHeader
    eyebrow="REQUEST OFF"
    title="희망 OFF 신청"
    description={`${monthLabel(month)} 달력에서 원하는 날짜를 선택하세요. 선택한 날짜를 다시 누르면 취소됩니다.`}
    action={<MonthPicker month={month} path="/nurse/request-off" />}
  />
    <div className="alert info">희망 OFF는 근무표의 실제 OFF와 다릅니다. 수간호사가 근무표 작성 시 참고하며, 승인 여부는 달력에 표시됩니다.</div>
    <section className="card calendar-card"><div className="calendar-summary"><span>이번 달 신청</span><strong>{requests.length}<small>일</small></strong><div><i className="dot requested"></i> 신청 <i className="dot approved"></i> 승인 <i className="dot rejected"></i> 반려</div></div><OffCalendar month={month} requests={requests}/></section>
  </>;
}
