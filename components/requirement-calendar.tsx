import { updateRequirementAction } from "@/app/actions";

type Requirement = {
  date: string;
  dayCount: number;
  eveningCount: number;
  nightCount: number;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function RequirementCalendar({
  scheduleId,
  month,
  requirements,
}: {
  scheduleId: number;
  month: string;
  requirements: Requirement[];
}) {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const cellCount = Math.ceil((firstWeekday + requirements.length) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) =>
    index >= firstWeekday && index < firstWeekday + requirements.length
      ? requirements[index - firstWeekday]
      : null,
  );

  return (
    <div className="requirement-calendar-scroll">
      <div className="requirement-calendar">
        <div className="requirement-calendar-weekdays" aria-hidden="true">
          {weekdayLabels.map((label, index) => (
            <span className={index === 0 ? "sunday" : index === 6 ? "saturday" : undefined} key={label}>
              {label}
            </span>
          ))}
        </div>
        <div className="requirement-calendar-grid">
          {cells.map((requirement, index) => {
            const weekdayClass = index % 7 === 0 ? " sunday" : index % 7 === 6 ? " saturday" : "";

            if (!requirement) {
              return <div className="requirement-calendar-blank" aria-hidden="true" key={`blank-${index}`} />;
            }

            const day = Number(requirement.date.slice(-2));
            return (
              <form
                action={updateRequirementAction}
                className={`requirement-calendar-day${weekdayClass}`}
                key={requirement.date}
              >
                <input type="hidden" name="scheduleId" value={scheduleId} />
                <input type="hidden" name="date" value={requirement.date} />
                <strong>{day}</strong>
                <div className="requirement-calendar-fields">
                  <label>
                    <span>D</span>
                    <input aria-label={`${monthNumber}월 ${day}일 Day 필요 인원`} name="dayCount" type="number" min="0" max="99" defaultValue={requirement.dayCount} />
                  </label>
                  <label>
                    <span>E</span>
                    <input aria-label={`${monthNumber}월 ${day}일 Evening 필요 인원`} name="eveningCount" type="number" min="0" max="99" defaultValue={requirement.eveningCount} />
                  </label>
                  <label>
                    <span>N</span>
                    <input aria-label={`${monthNumber}월 ${day}일 Night 필요 인원`} name="nightCount" type="number" min="0" max="99" defaultValue={requirement.nightCount} />
                  </label>
                </div>
                <button className="button tiny secondary" type="submit">저장</button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
