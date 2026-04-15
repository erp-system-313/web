import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from './Login.module.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export const LoginPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!authContext) return;
    
    setLoading(true);
    try {
      const result = await authContext.login({ email: data.email, password: data.password });
      
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
            <Input 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              prefix={<UserOutlined />} 
              placeholder="Email address"
              status={errors.email ? 'error' : undefined}
            />
            {errors.email && (
              <Text type="danger" style={{ fontSize: 12 }}>{errors.email.message}</Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <Input.Password 
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              prefix={<LockOutlined />} 
              placeholder="Password"
              status={errors.password ? 'error' : undefined}
            />
            {errors.password && (
              <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <Checkbox {...register('remember')}>Remember me</Checkbox>
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Sign In
          </Button>
        </form>

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
