import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Table, Spin, Statistic } from "antd";
import { TeamOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, BankOutlined } from "@ant-design/icons";
import { useEmployees, useDepartments } from "../../../hooks";
import { hrService } from "../../../services/hrService";
import type { LeaveRequest } from "../../../types/hr";
import styles from "./HRDashboard.module.css";

const { Title } = Typography;

export const HRDashboard: React.FC = () => {
  const { data: employees, loading: empLoading } = useEmployees();
  const { data: departments } = useDepartments();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLeaveLoading(true);
      try {
        const [leaveRes, attRes] = await Promise.all([
          hrService.leave.getAll({ status: "PENDING", page: 0, size: 10 }),
          hrService.attendance.getAll({ startDate: new Date().toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0], page: 0, size: 200 }),
        ]);
        setPendingLeaves(leaveRes?.content ?? []);
        setPresentToday((attRes?.content ?? []).filter((r: { status: string }) => r.status === "PRESENT").length);
        setAbsentToday((attRes?.content ?? []).filter((r: { status: string }) => r.status === "ABSENT").length);
      } catch {
        // silent
      } finally {
        setLeaveLoading(false);
      }
    };
    fetchData();
  }, []);

  const leaveColumns = [
    { title: "Employee", dataIndex: "employeeName", key: "employeeName" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Start", dataIndex: "startDate", key: "startDate" },
    { title: "End", dataIndex: "endDate", key: "endDate" },
  ];

  return (
    <div className={styles.container}>
      <Title level={2}>HR Overview</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Employees" value={employees?.length ?? 0} prefix={<TeamOutlined />} loading={empLoading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Departments" value={departments?.length ?? 0} prefix={<BankOutlined />} loading={empLoading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Pending Leaves" value={pendingLeaves.length} prefix={<CalendarOutlined />} valueStyle={{ color: "#faad14" }} loading={leaveLoading} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Present Today" value={presentToday} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} loading={leaveLoading} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Pending Leave Requests">
            <Table
              dataSource={pendingLeaves}
              columns={leaveColumns}
              rowKey="id"
              loading={leaveLoading}
              pagination={false}
              locale={{ emptyText: "No pending leave requests" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HRDashboard;
