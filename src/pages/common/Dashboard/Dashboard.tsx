import { Card, Row, Col, Typography, Statistic, List, Avatar } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const stats = [
    { title: 'Total Employees', value: 6, icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Pending Leave', value: 2, icon: <CalendarOutlined />, color: '#faad14' },
    { title: 'Active Orders', value: 12, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: 'Today Present', value: 3, icon: <CheckCircleOutlined />, color: '#722ed1' },
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

      <Row gutter={[16, 16]} className={styles.statsRow}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Quick Links" className={styles.quickLinksCard}>
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
          <Card title="Recent Activity" className={styles.activityCard}>
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
