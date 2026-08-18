import { dayLabel } from "@/lib/date";

export function DayBars({ data, warningAt = 4, emptyText = "신청 내역이 없습니다." }: { data: Array<{ date: string; count: number }>; warningAt?: number; emptyText?: string }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  if (!data.length) return <div className="empty-state compact">{emptyText}</div>;
  return (
    <div className="day-bars">
      {data.map((item) => (
        <div className="bar-row" key={item.date}>
          <span>{dayLabel(item.date)}</span>
          <div className="bar-track"><span className={item.count >= warningAt ? "warning" : ""} style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }} /></div>
          <strong>{item.count}명 {item.count >= warningAt && <span aria-label="신청 집중 경고">⚠</span>}</strong>
        </div>
      ))}
    </div>
  );
}
