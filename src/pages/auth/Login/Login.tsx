import { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './Login.module.css';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string; remember?: boolean }) => {
    setLoading(true);
    try {
      const result = await login({ email: values.email, password: values.password });
      
      if (result.success) {
        message.success('Login successful');
        navigate('/dashboard');
      } else {
        message.error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <Title level={2} className={styles.title}>ERP System</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email address" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <Text type="secondary">Demo accounts:</Text>
          <div className={styles.demoAccounts}>
            <Text>admin@company.com / admin123</Text>
            <Text>manager@company.com / manager123</Text>
            <Text>staff@company.com / staff123</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
