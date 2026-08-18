import type { ShiftType } from "@/lib/domain";
import { dateKey, daysInMonth, weekday } from "@/lib/date";
import { countShifts } from "@/lib/statistics";

export type ScheduleNurse = { id: number; name: string };
export type ScheduleCell = { userId: number; date: string; shift: ShiftType | null };

export function ReadonlyScheduleTable({ month, nurses, entries, highlightUserId }: { month: string; nurses: ScheduleNurse[]; entries: ScheduleCell[]; highlightUserId?: number }) {
  const days = Array.from({ length: daysInMonth(month) }, (_, index) => index + 1);
  const entryMap = new Map(entries.map((entry) => [`${entry.userId}-${entry.date}`, entry.shift]));
  return (
    <div className="schedule-scroll">
      <table className="schedule-table">
        <thead><tr><th className="name-cell">간호사</th>{days.map((day) => { const date = dateKey(month, day); return <th key={day} className={weekday(date) === "토" || weekday(date) === "일" ? "weekend" : ""}>{day}<small>{weekday(date)}</small></th>; })}<th>합계</th></tr></thead>
        <tbody>{nurses.map((nurse) => {
          const shifts = days.map((day) => entryMap.get(`${nurse.id}-${dateKey(month, day)}`) ?? null);
          const counts = countShifts(shifts);
          return <tr key={nurse.id} className={nurse.id === highlightUserId ? "highlight-row" : ""}><th className="name-cell">{nurse.name}{nurse.id === highlightUserId && <small>나</small>}</th>{days.map((day) => { const shift = entryMap.get(`${nurse.id}-${dateKey(month, day)}`) ?? null; return <td key={day}><span className={`shift shift-${shift ?? "none"}`}>{shift === "O" ? "O" : shift ?? "·"}</span></td>; })}<td className="stat-mini">D{counts.D} E{counts.E} N{counts.N} O{counts.O}</td></tr>;
        })}</tbody>
      </table>
    </div>
  );
}
