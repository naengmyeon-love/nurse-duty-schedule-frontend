"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ShiftType } from "@/lib/domain";
import { dateKey, daysInMonth, weekday } from "@/lib/date";
import type { ScheduleCell, ScheduleNurse } from "@/components/schedule-table";

type Requirement = { date: string; dayCount: number; eveningCount: number; nightCount: number };

export function ScheduleEditor({ scheduleId, month, nurses, initialEntries, requirements, offDates, vacationDates, readOnly = false }: {
  scheduleId: number;
  month: string;
  nurses: ScheduleNurse[];
  initialEntries: ScheduleCell[];
  requirements: Requirement[];
  offDates: Array<{ userId: number; date: string }>;
  vacationDates: Array<{ userId: number; date: string }>;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(() => new Map(initialEntries.map((item) => [`${item.userId}-${item.date}`, item.shift])));
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const days = useMemo(() => Array.from({ length: daysInMonth(month) }, (_, i) => i + 1), [month]);
  const offSet = useMemo(() => new Set(offDates.map((item) => `${item.userId}-${item.date}`)), [offDates]);
  const vacationSet = useMemo(() => new Set(vacationDates.map((item) => `${item.userId}-${item.date}`)), [vacationDates]);
  const requirementMap = useMemo(() => new Map(requirements.map((item) => [item.date, item])), [requirements]);

  async function update(userId: number, date: string, value: string) {
    if (saving || readOnly) return;
    const key = `${userId}-${date}`;
    const before = entries.get(key) ?? null;
    const shift = (value || null) as ShiftType | null;
    setEntries(new Map(entries).set(key, shift));
    setSaving(key);
    setError("");
    try {
      const response = await fetch("/api/schedule-entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduleId, userId, date, shift }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "변경을 저장하지 못했습니다. 다시 시도해 주세요.");
      }
      router.refresh();
    } catch (cause) {
      setEntries((current) => new Map(current).set(key, before));
      setError(cause instanceof Error ? cause.message : "네트워크 오류로 변경을 저장하지 못했습니다.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {error && <p className="alert error" role="alert">저장하지 않았습니다. {error}</p>}
      <p className="form-help" aria-live="polite">{saving ? "필수 조건을 검사하고 저장 중입니다…" : readOnly ? "확정표는 조회 중입니다. 직접 수정하려면 최종 검토 상태로 전환하세요." : "필수 조건을 위반한 변경은 저장되지 않습니다. · 표시는 미배정이며 OFF와 다릅니다."}</p>
      <div className="schedule-scroll">
      <table className="schedule-table editor-table">
        <thead><tr><th className="name-cell">간호사</th>{days.map((day) => { const date = dateKey(month, day); return <th key={day} className={weekday(date) === "토" || weekday(date) === "일" ? "weekend" : ""}>{day}<small>{weekday(date)}</small></th>; })}</tr></thead>
        <tbody>
          {nurses.map((nurse) => <tr key={nurse.id}><th className="name-cell">{nurse.name}</th>{days.map((day) => {
            const date = dateKey(month, day); const key = `${nurse.id}-${date}`; const shift = entries.get(key) ?? ""; const requested = offSet.has(key); const vacation = vacationSet.has(key);
            return <td key={day} className={vacation ? "vacation-cell" : requested ? "requested-cell" : ""} title={vacation ? "승인 휴가" : requested ? "희망 OFF 신청" : undefined}>
              <select aria-label={`${nurse.name} ${day}일 근무`} className={`shift-select shift-${shift || "none"}`} value={shift ?? ""} disabled={Boolean(saving) || readOnly} onChange={(event) => update(nurse.id, date, event.target.value)}>
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
    </div>
  );
}
