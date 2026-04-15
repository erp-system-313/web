import { useContext, useState } from 'react';
import { Card, Form, Input, Button, Typography, Avatar, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './Profile.module.css';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('Profile updated successfully');
      setLoading(false);
    }, 500);
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Avatar size={80} icon={<UserOutlined />} className={styles.avatar} />
          <Title level={3}>{user?.name || 'User'}</Title>
          <Text type="secondary">{user?.role || 'Staff'}</Text>
        </div>

        <Divider />

        <Title level={4}>Personal Information</Title>
        <Form
          layout="vertical"
          initialValues={{
            firstName: user?.name?.split(' ')[0] || '',
            lastName: user?.name?.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
            phone: '',
          }}
          onFinish={onFinish}
        >
          <div className={styles.formGrid}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true }, { type: 'email' }]}
            >
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Title level={4}>Change Password</Title>
        <Form layout="vertical">
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Enter current password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: 'Enter new password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: 'Confirm new password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="default">Change Password</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
