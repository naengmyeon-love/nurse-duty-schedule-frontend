import type { CareShift } from "@/lib/domain";

export function CareContextPicker({
  date,
  shift,
  path,
  showShift = true,
}: {
  date: string;
  shift?: CareShift;
  path: string;
  showShift?: boolean;
}) {
  return (
    <form className="care-context-picker" action={path} method="get">
      <label>
        <span>날짜</span>
        <input type="date" name="date" defaultValue={date} />
      </label>
      {showShift && (
        <label>
          <span>근무조</span>
          <select name="shift" defaultValue={shift ?? "D"}>
            <option value="D">D · Day</option>
            <option value="E">E · Evening</option>
            <option value="N">N · Night</option>
          </select>
        </label>
      )}
      <button className="button secondary" type="submit">조회</button>
    </form>
  );
}
