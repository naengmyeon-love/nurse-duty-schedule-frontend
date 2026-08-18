export function MonthPicker({ month, path }: { month: string; path: string }) {
  return (
    <form className="month-picker" action={path} method="get">
      <label htmlFor="month">조회 월</label>
      <input id="month" name="month" type="month" defaultValue={month} />
      <button className="button secondary" type="submit">조회</button>
    </form>
  );
}
