import { Tooltip } from "antd";
import dayjs from "dayjs";
import type { Attendance } from "../../../types/hr";
import styles from "./AttendanceCalendar.module.css";

interface Props {
  records: Attendance[];
  currentMonth: dayjs.Dayjs;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: styles.present,
  ABSENT: styles.absent,
  LATE: styles.late,
  HALF_DAY: styles.halfDay,
  LEAVE: styles.leave,
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "P",
  ABSENT: "A",
  LATE: "L",
  HALF_DAY: "HD",
  LEAVE: "LV",
};

export const AttendanceCalendar: React.FC<Props> = ({
  records,
  currentMonth,
}) => {
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const recordsByDate = new Map<string, Attendance[]>();
  records.forEach((r) => {
    if (r.date) {
      const existing = recordsByDate.get(r.date) || [];
      existing.push(r);
      recordsByDate.set(r.date, existing);
    }
  });

  const cells: { date: dayjs.Dayjs; isOtherMonth: boolean }[] = [];

  const prevMonthEnd = startOfMonth.subtract(1, "day");
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ date: prevMonthEnd.subtract(i, "day"), isOtherMonth: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: startOfMonth.date(d),
      isOtherMonth: false,
    });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: endOfMonth.add(i, "day"),
        isOtherMonth: true,
      });
    }
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isWeekend = (d: dayjs.Dayjs) => d.day() === 0 || d.day() === 6;
  const isToday = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");

  const statusSummary = (dayRecords: Attendance[]) => {
    const counts: Record<string, number> = {};
    dayRecords.forEach((r) => {
      if (r.status) counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => {
        const colorClass = STATUS_COLORS[status] || "";
        return { status, count, colorClass };
      });
  };

  const tooltipContent = (dayRecords: Attendance[]) =>
    dayRecords.map((r, i) => (
      <div key={i}>
        {r.employeeName || `Employee #${r.employeeId}`}: {STATUS_LABELS[r.status] || r.status}
        {r.checkIn ? ` ${dayjs(r.checkIn).format("HH:mm")}` : ""}
        {r.checkOut ? `-${dayjs(r.checkOut).format("HH:mm")}` : ""}
      </div>
    ));

  return (
    <div className={styles.calendar}>
      <div className={styles.weekDays}>
        {weekDays.map((wd) => (
          <div key={wd} className={styles.weekDay}>
            {wd}
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((cell, i) => {
          const dateStr = cell.date.format("YYYY-MM-DD");
          const dayRecords = recordsByDate.get(dateStr) || [];
          const weekend = isWeekend(cell.date);
          const today = isToday(cell.date);
          const summary = statusSummary(dayRecords);

          let cellClass = styles.dayCell;
          if (cell.isOtherMonth) cellClass += ` ${styles.otherMonth}`;
          if (today) cellClass += ` ${styles.today}`;
          if (weekend && dayRecords.length === 0) cellClass += ` ${styles.weekend}`;

          const cellContent = (
            <div key={i} className={cellClass}>
              <span className={styles.dayNumber}>{cell.date.format("D")}</span>
              {dayRecords.length === 1 ? (
                <div
                  className={`${styles.statusDot} ${STATUS_COLORS[dayRecords[0].status] || ""}`}
                >
                  {STATUS_LABELS[dayRecords[0].status] || dayRecords[0].status?.charAt(0)}
                </div>
              ) : dayRecords.length > 1 ? (
                <div className={styles.multiDots}>
                  {summary.slice(0, 3).map((s, j) => (
                    <div
                      key={j}
                      className={`${styles.miniDot} ${s.colorClass}`}
                      title={`${s.status}: ${s.count}`}
                    />
                  ))}
                  {summary.length > 3 && (
                    <span className={styles.moreCount}>+{summary.length - 3}</span>
                  )}
                </div>
              ) : weekend ? (
                <div className={styles.weekendDash}>-</div>
              ) : null}
            </div>
          );

          return dayRecords.length > 1 ? (
            <Tooltip key={i} title={tooltipContent(dayRecords)}>
              {cellContent}
            </Tooltip>
          ) : (
            cellContent
          );
        })}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.present}`} /> Present
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.absent}`} /> Absent
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.late}`} /> Late
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.halfDay}`} /> Half Day
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.leave}`} /> Leave
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
