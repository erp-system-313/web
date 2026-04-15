import { Card, Row, Col, Typography, List, Avatar } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const { Title, Text } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];

export const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const employeeData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 5 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 6 },
  ];

  const departmentData = [
    { name: 'HR', value: 1 },
    { name: 'Engineering', value: 2 },
    { name: 'Sales', value: 1 },
    { name: 'IT', value: 1 },
    { name: 'Finance', value: 1 },
  ];

  const leaveBalanceData = [
    { name: 'Annual', used: 5, remaining: 16 },
    { name: 'Sick', used: 2, remaining: 8 },
    { name: 'Personal', used: 1, remaining: 4 },
  ];

  const recentActivities = [
    { id: 1, action: 'Sarah Johnson clocked in', time: '9:00 AM' },
    { id: 2, action: 'Leave request submitted by Michael Chen', time: '8:30 AM' },
    { id: 3, action: 'New employee Emily Rodriguez added', time: 'Yesterday' },
    { id: 4, action: 'Purchase order #1234 approved', time: 'Yesterday' },
  ];

  const quickLinks = [
    { title: 'Employees', path: '/hr/employees', description: 'Manage employee records' },
    { title: 'Attendance', path: '/hr/attendance', description: 'Track daily attendance' },
    { title: 'Leave Requests', path: '/hr/leave', description: 'Review and approve leave' },
    { title: 'Profile', path: '/profile', description: 'View and edit your profile' },
    { title: 'User Management', path: '/admin/users', description: 'Manage system users' },
    { title: 'Company Settings', path: '/admin/settings', description: 'Configure company settings' },
    { title: 'Audit Logs', path: '/admin/audit-logs', description: 'View system audit logs' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>Welcome back, {user?.name || 'User'}!</Title>
        <Text type="secondary">Here's what's happening in your ERP system today.</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>6</div>
              <div style={{ color: '#8c8c8c' }}>Total Employees</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>2</div>
              <div style={{ color: '#8c8c8c' }}>Pending Leave</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>12</div>
              <div style={{ color: '#8c8c8c' }}>Active Orders</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>3</div>
              <div style={{ color: '#8c8c8c' }}>Today Present</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Employee Trends">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={employeeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Department Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Leave Balance Overview">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leaveBalanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="used" fill="#faad14" name="Used Days" />
                <Bar dataKey="remaining" fill="#52c41a" name="Remaining Days" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Quick Links and Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Quick Links">
            <List
              dataSource={quickLinks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<a href={item.path}>{item.title}</a>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
