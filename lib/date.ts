const pad = (value: number) => String(value).padStart(2, "0");

export function currentMonth(now = new Date()) {
  return currentDateInKorea(now).slice(0, 7);
}

export function currentDateInKorea(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function monthLabel(month: string) {
  const [year, value] = month.split("-").map(Number);
  return `${year}년 ${value}월`;
}

export function daysInMonth(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Date(year, value, 0).getDate();
}

export function dateKey(month: string, day: number) {
  return `${month}-${pad(day)}`;
}

export function dayLabel(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
}

export function weekday(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date(y, m - 1, d));
}

export function dateRange(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function overlapDays(start: string, end: string, month: string) {
  return dateRange(start, end).filter((date) => date.startsWith(month));
}
