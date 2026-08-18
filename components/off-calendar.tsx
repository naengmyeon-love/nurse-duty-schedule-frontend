import { createOffRequestAction, deleteOffRequestAction } from "@/app/actions";
import { dateKey, daysInMonth } from "@/lib/date";
import { requestStatusLabel } from "@/lib/labels";
import type { RequestStatus } from "@/lib/domain";

export function OffCalendar({ month, requests }: { month: string; requests: Array<{ id: number; date: string; status: RequestStatus }> }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const offset = new Date(year, monthNumber - 1, 1).getDay();
  const requestMap = new Map(requests.map((request) => [request.date, request]));
  return <div className="calendar"><div className="calendar-weekdays">{["일","월","화","수","목","금","토"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: offset }, (_, i) => <span className="calendar-blank" key={`blank-${i}`}/>)}{Array.from({ length: daysInMonth(month) }, (_, i) => { const day = i + 1; const date = dateKey(month, day); const request = requestMap.get(date); return request ? <form action={deleteOffRequestAction} key={date}><input type="hidden" name="id" value={request.id}/><button className={`calendar-day selected status-${request.status.toLowerCase()}`} title="클릭하여 신청 취소"><span>{day}</span><strong>희망 OFF</strong><small>{requestStatusLabel[request.status]}</small></button></form> : <form action={createOffRequestAction} key={date}><input type="hidden" name="date" value={date}/><button className="calendar-day" title="희망 OFF 신청"><span>{day}</span><small>신청</small></button></form>; })}</div></div>;
}
