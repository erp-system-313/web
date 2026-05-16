import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Table, Spin, Statistic } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  FileProtectOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { apiClient } from "../../../api/client";
import { dashboardService } from "../../../services/dashboardService";
import type { DashboardStats } from "../../../services/dashboardService";

const { Title } = Typography;

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardData, usersRes, rolesRes] = await Promise.all([
          dashboardService.getStats(),
          apiClient.get("/v1/users", { params: { page: 0, size: 1 } }),
          apiClient.get("/v1/roles"),
        ]);
        setStats(dashboardData);
        setUserCount(usersRes.data.data?.totalElements ?? 0);
        setRoleCount((rolesRes.data.data?.content ?? rolesRes.data.data ?? []).length);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const auditColumns = [
    { title: "Order", dataIndex: "orderNumber", key: "orderNumber" },
    { title: "Customer", dataIndex: "customerName", key: "customerName" },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => (v ? `$${v.toLocaleString()}` : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => s?.replace(/_/g, " "),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Admin Overview</Title>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Total Users" value={userCount} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="System Roles" value={roleCount} prefix={<FileProtectOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Employees"
                value={stats?.totalEmployees ?? 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Invoices"
                value={stats?.pendingInvoices ?? 0}
                prefix={<AuditOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Quick Actions" style={{ textAlign: "center", color: "#8c8c8c" }}>
              Use the Admin sidebar menu to manage Users, Roles, Settings, and Audit Logs.
            </Card>
          </Col>
        </Row>
        {stats?.recentOrders && stats.recentOrders.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card title="Recent Orders">
                <Table
                  dataSource={stats.recentOrders}
                  columns={auditColumns}
                  rowKey="orderId"
                  pagination={false}
                  locale={{ emptyText: "No recent orders" }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default AdminDashboard;
