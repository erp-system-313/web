import { useState } from "react";
import { Card, Typography, Table, Button, Space, Tag, message, Select, Row, Col, Statistic } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useAttendance, useClockIn, useClockOut, useEmployees } from "../../../hooks";
import dayjs from "dayjs";
import styles from "./Attendance.module.css";

const { Title } = Typography;

export const AttendancePage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedEmployee, setSelectedEmployee] = useState<number | undefined>(undefined);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  const startDate = currentMonth.startOf("month").format("YYYY-MM-DD");
  const endDate = currentMonth.endOf("month").format("YYYY-MM-DD");

  const { data: records, loading, refetch } = useAttendance({
    employeeId: selectedEmployee,
    startDate,
    endDate,
  });
  const { data: employees } = useEmployees();
  const { clockIn, loading: clockingIn } = useClockIn();
  const { clockOut, loading: clockingOut } = useClockOut();

  const handleClockIn = async () => {
    try {
      await clockIn();
      setTodayCheckedIn(true);
      message.success("Clocked in successfully");
      refetch();
    } catch {
      message.error("Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      setTodayCheckedIn(false);
      message.success("Clocked out successfully");
      refetch();
    } catch {
      message.error("Failed to clock out");
    }
  };

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const halfDayCount = records.filter((r) => r.status === "HALF_DAY").length;

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (v: string) => v || "-",
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (v: string) => v || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "PRESENT" ? "green" : status === "LATE" ? "orange" : status === "HALF_DAY" ? "purple" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Attendance</Title>
          <Space>
            <Select
              allowClear
              placeholder="All Employees"
              style={{ width: 200 }}
              value={selectedEmployee}
              onChange={(v) => setSelectedEmployee(v)}
              options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
            />
            <Button icon={<LeftOutlined />} onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} />
            <span style={{ fontWeight: 500, minWidth: 140, textAlign: "center", display: "inline-block" }}>
              {currentMonth.format("MMMM YYYY")}
            </span>
            <Button icon={<RightOutlined />} onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} />
          </Space>
        </div>

        <Row gutter={[16, 16]} className={styles.summaryRow}>
          <Col xs={12} sm={6}>
            <Card size="small"><Statistic title="Total" value={records.length} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small"><Statistic title="Present" value={presentCount} valueStyle={{ color: "#52c41a" }} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small"><Statistic title="Absent" value={absentCount} valueStyle={{ color: "#ff4d4f" }} /></Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small"><Statistic title="Late" value={lateCount} valueStyle={{ color: "#faad14" }} /></Card>
          </Col>
        </Row>
        {halfDayCount > 0 && (
          <Row gutter={[16, 16]} style={{ marginTop: 0 }}>
            <Col xs={12} sm={6} offset={18}>
              <Card size="small"><Statistic title="Half Day" value={halfDayCount} valueStyle={{ color: "#722ed1" }} /></Card>
            </Col>
          </Row>
        )}

        <div className={styles.clockSection}>
          <Space size="large">
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={handleClockIn}
              loading={clockingIn}
              disabled={todayCheckedIn}
              size="large"
            >
              Clock In
            </Button>
            <Button
              type="primary"
              danger
              icon={<CheckCircleOutlined />}
              onClick={handleClockOut}
              loading={clockingOut}
              disabled={!todayCheckedIn}
              size="large"
            >
              Clock Out
            </Button>
          </Space>
        </div>

        <div className={styles.tableSection}>
          <Title level={5}>Attendance Records</Title>
          <Table
            dataSource={records}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} records` }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;
