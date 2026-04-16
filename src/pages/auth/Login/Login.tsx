import { useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    control,
    handleSubmit,
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
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...field}
                    prefix={<UserOutlined />}
                    placeholder="Email address"
                    status={fieldState.error ? 'error' : undefined}
                  />
                  {fieldState.error && (
                    <Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
              render={({ field, fieldState }) => (
                <>
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    status={fieldState.error ? 'error' : undefined}
                  />
                  {fieldState.error && (
                    <Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>Remember me</Checkbox>
              )}
            />
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
