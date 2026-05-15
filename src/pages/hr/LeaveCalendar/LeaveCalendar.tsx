import { useState, useEffect, useCallback } from "react";
import { Card, Typography, Button, Spin, Tag, Space } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { hrService } from "../../../services/hrService";
import type { LeaveRequest, LeaveType } from "../../../types/hr";
import dayjs from "dayjs";
import styles from "./LeaveCalendar.module.css";

const { Title, Text } = Typography;

const leaveColors: Record<LeaveType, string> = {
  ANNUAL: "#1890ff",
  SICK: "#ff4d4f",
  PERSONAL: "#fa8c16",
  UNPAID: "#8c8c8c",
  MATERNITY: "#52c41a",
  PATERNITY: "#13c2c2",
};

export const LeaveCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const startOfMonth = currentMonth.startOf("month").format("YYYY-MM-DD");
      const endOfMonth = currentMonth.endOf("month").format("YYYY-MM-DD");
      const result = await hrService.leave.getAll({
        startDate: startOfMonth,
        endDate: endOfMonth,
        page: 0,
        size: 200,
      });
      setLeaves(result.content ?? []);
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const getLeavesForDay = (day: number) => {
    const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
    return leaves.filter((l) => dateStr >= l.startDate && dateStr <= l.endDate);
  };

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <div className={styles.header}>
        <Title level={3}>Leave Calendar</Title>
        <Space>
          <Button icon={<LeftOutlined />} onClick={prevMonth} />
          <Text strong style={{ fontSize: 16, minWidth: 180, textAlign: "center" }}>
            {currentMonth.format("MMMM YYYY")}
          </Text>
          <Button icon={<RightOutlined />} onClick={nextMonth} />
        </Space>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <div className={styles.calendar}>
          <div className={styles.weekRow}>
            {dayHeaders.map((d) => (
              <div key={d} className={styles.dayHeader}>{d}</div>
            ))}
          </div>
          <div className={styles.daysGrid}>
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptyDay} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayLeaves = getLeavesForDay(day);
              return (
                <div key={day} className={styles.dayCell}>
                  <div className={styles.dayNumber}>{day}</div>
                  <div className={styles.leaveItems}>
                    {dayLeaves.slice(0, 3).map((l) => (
                      <div
                        key={l.id}
                        className={styles.leaveItem}
                        style={{ backgroundColor: leaveColors[l.type] || "#1890ff" }}
                        title={`${l.employeeName} - ${l.type}`}
                      >
                        {l.employeeName}
                      </div>
                    ))}
                    {dayLeaves.length > 3 && (
                      <Text className={styles.moreText}>+{dayLeaves.length - 3} more</Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={styles.legend}>
        {(Object.keys(leaveColors) as LeaveType[]).map((t) => (
          <Tag key={t} color={leaveColors[t]}>{t.charAt(0) + t.slice(1).toLowerCase()}</Tag>
        ))}
      </div>
    </Card>
  );
};

export default LeaveCalendar;
