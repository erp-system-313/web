import { Card, Form, Input, Button, Typography, Tabs, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useSettings, useUpdateSettings } from '../../../hooks/useSettings';
import styles from './Settings.module.css';

const { Title } = Typography;

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { data: settings, loading, refetch } = useSettings();
  const { update, loading: updating } = useUpdateSettings();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await update(values);
      message.success('Settings saved successfully');
      refetch();
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFinish={handleSave}
        >
          <Form.Item label="Company Name" name="companyName">
            <Input />
          </Form.Item>
          <Form.Item label="Company Email" name="companyEmail">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Company Phone" name="companyPhone">
            <Input />
          </Form.Item>
          <Form.Item label="Company Address" name="companyAddress">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Tax Number" name="taxNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Currency" name="currency">
            <Input placeholder="USD" />
          </Form.Item>
          <Form.Item label="Fiscal Year Start (month)" name="fiscalYearStart">
            <Input type="number" min={1} max={12} placeholder="1-12" />
          </Form.Item>
          <Form.Item label="Timezone" name="timezone">
            <Input placeholder="UTC" />
          </Form.Item>
          <Form.Item label="Date Format" name="dateFormat">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
            Save Changes
          </Button>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <Form layout="vertical">
          <p style={{ color: '#8c8c8c' }}>Notification settings coming soon...</p>
        </Form>
      ),
    },
    {
      key: 'hr',
      label: 'HR Settings',
      children: (
        <Form layout="vertical">
          <p style={{ color: '#8c8c8c' }}>HR settings coming soon...</p>
        </Form>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <Title level={3}>Company Settings</Title>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;