"use client";

import { useMemo, useState } from "react";
import type { ShiftType } from "@/lib/domain";
import { dateKey, daysInMonth, weekday } from "@/lib/date";
import type { ScheduleCell, ScheduleNurse } from "@/components/schedule-table";

type Requirement = { date: string; dayCount: number; eveningCount: number; nightCount: number };

export function ScheduleEditor({ scheduleId, month, nurses, initialEntries, requirements, offDates, vacationDates }: {
  scheduleId: number;
  month: string;
  nurses: ScheduleNurse[];
  initialEntries: ScheduleCell[];
  requirements: Requirement[];
  offDates: Array<{ userId: number; date: string }>;
  vacationDates: Array<{ userId: number; date: string }>;
}) {
  const [entries, setEntries] = useState(() => new Map(initialEntries.map((item) => [`${item.userId}-${item.date}`, item.shift])));
  const [saving, setSaving] = useState<string | null>(null);
  const days = useMemo(() => Array.from({ length: daysInMonth(month) }, (_, i) => i + 1), [month]);
  const offSet = useMemo(() => new Set(offDates.map((item) => `${item.userId}-${item.date}`)), [offDates]);
  const vacationSet = useMemo(() => new Set(vacationDates.map((item) => `${item.userId}-${item.date}`)), [vacationDates]);
  const requirementMap = useMemo(() => new Map(requirements.map((item) => [item.date, item])), [requirements]);

  async function update(userId: number, date: string, value: string) {
    const key = `${userId}-${date}`;
    const before = entries.get(key) ?? null;
    const shift = (value || null) as ShiftType | null;
    setEntries(new Map(entries).set(key, shift));
    setSaving(key);
    const response = await fetch("/api/schedule-entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduleId, userId, date, shift }) });
    if (!response.ok) setEntries((current) => new Map(current).set(key, before));
    setSaving(null);
  }

  return (
    <div className="schedule-scroll">
      <table className="schedule-table editor-table">
        <thead><tr><th className="name-cell">간호사</th>{days.map((day) => { const date = dateKey(month, day); return <th key={day} className={weekday(date) === "토" || weekday(date) === "일" ? "weekend" : ""}>{day}<small>{weekday(date)}</small></th>; })}</tr></thead>
        <tbody>
          {nurses.map((nurse) => <tr key={nurse.id}><th className="name-cell">{nurse.name}</th>{days.map((day) => {
            const date = dateKey(month, day); const key = `${nurse.id}-${date}`; const shift = entries.get(key) ?? ""; const requested = offSet.has(key); const vacation = vacationSet.has(key);
            return <td key={day} className={vacation ? "vacation-cell" : requested ? "requested-cell" : ""} title={vacation ? "승인 휴가" : requested ? "희망 OFF 신청" : undefined}>
              <select aria-label={`${nurse.name} ${day}일 근무`} className={`shift-select shift-${shift || "none"}`} value={shift ?? ""} disabled={saving === key} onChange={(event) => update(nurse.id, date, event.target.value)}>
                <option value="">·</option><option value="D">D</option><option value="E">E</option><option value="N">N</option><option value="O">O</option>
              </select>{(requested || vacation) && <span className="cell-marker">{vacation ? "휴" : "희"}</span>}
            </td>;
          })}</tr>)}
        </tbody>
        <tfoot>
          {(["D", "E", "N"] as const).map((shift) => <tr key={shift}><th className="name-cell">{shift} 배정</th>{days.map((day) => { const date = dateKey(month, day); const actual = nurses.filter((nurse) => entries.get(`${nurse.id}-${date}`) === shift).length; const req = requirementMap.get(date); const needed = shift === "D" ? req?.dayCount : shift === "E" ? req?.eveningCount : req?.nightCount; const short = actual < (needed ?? 0); return <td key={day} className={short ? "shortage" : "staffing-ok"}><strong>{actual}</strong><small>/{needed ?? 0}</small></td>; })}</tr>)}
        </tfoot>
      </table>
    </div>
  );
}
