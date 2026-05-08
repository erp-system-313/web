import { Card, Row, Col, Typography, Avatar, Spin } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AuthContext } from "../../../contexts/AuthContext";
import { useDashboardStats } from "../../../hooks/useDashboardStats";
import styles from "./Dashboard.module.css";

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { data: stats, loading, error } = useDashboardStats();

  const quickLinks = [
    {
      title: "Employees",
      path: "/hr/employees",
      description: "Manage employee records",
    },
    {
      title: "Attendance",
      path: "/hr/attendance",
      description: "Track daily attendance",
    },
    {
      title: "Leave Requests",
      path: "/hr/leave",
      description: "Review and approve leave",
    },
    {
      title: "Profile",
      path: "/profile",
      description: "View and edit your profile",
    },
    {
      title: "User Management",
      path: "/admin/users",
      description: "Manage system users",
    },
    {
      title: "Company Settings",
      path: "/admin/settings",
      description: "Configure company settings",
    },
    {
      title: "Audit Logs",
      path: "/admin/audit-logs",
      description: "View system audit logs",
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>Welcome back, {user?.name || "User"}!</Title>
        <Text type="secondary">
          Here's what's happening in your ERP system today.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {stats?.totalEmployees || 0}
              </div>
              <div style={{ color: "#8c8c8c" }}>Total Employees</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <CalendarOutlined style={{ fontSize: 24, color: "#faad14" }} />
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {stats?.pendingOrders || 0}
              </div>
              <div style={{ color: "#8c8c8c" }}>Pending Orders</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <FileTextOutlined style={{ fontSize: 24, color: "#52c41a" }} />
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {stats?.pendingInvoices || 0}
              </div>
              <div style={{ color: "#8c8c8c" }}>Pending Invoices</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <WarningOutlined style={{ fontSize: 24, color: "#f5222d" }} />
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {stats?.lowStockProducts || 0}
              </div>
              <div style={{ color: "#8c8c8c" }}>Low Stock</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Sales Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1890ff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Products">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.topProducts || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productName" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="quantitySold" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Recent Orders">
            <div>
              {(stats?.recentOrders || []).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom:
                      i < (stats?.recentOrders?.length || 0) - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <Avatar
                    icon={<FileTextOutlined />}
                    size="small"
                    style={{ marginRight: 12 }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      Order #{item.orderNumber} - {item.customerName || "N/A"}
                    </div>
                    <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                      {item.status} - ${item.totalAmount ?? 0} -{" "}
                      {item.orderDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Links and Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Quick Links">
            <div>
              {quickLinks.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < quickLinks.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>
                    <a href={item.path}>{item.title}</a>
                  </div>
                  <div style={{ color: "#8c8c8c", fontSize: 13 }}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
