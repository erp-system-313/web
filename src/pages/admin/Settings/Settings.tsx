import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Tabs, message, Select, InputNumber } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import styles from './Settings.module.css';

const { Title } = Typography;
const { Option } = Select;

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      message.success('Settings saved successfully');
      setLoading(false);
    }, 500);
  };

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Company Name" name="companyName" initialValue="ERP System Inc.">
            <Input />
          </Form.Item>
          <Form.Item label="Tax ID" name="taxId" initialValue="12-3456789">
            <Input />
          </Form.Item>
          <Form.Item label="Currency" name="currency" initialValue="USD">
            <Select>
              <Option value="USD">USD - US Dollar</Option>
              <Option value="EUR">EUR - Euro</Option>
              <Option value="GBP">GBP - British Pound</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Fiscal Year Start" name="fiscalYearStart" initialValue="01-01">
            <Input placeholder="MM-DD" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Save Changes
          </Button>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email Notifications" name="emailNotifications" initialValue={true} valuePropName="checked">
            <Select>
              <Option value={true}>Enabled</Option>
              <Option value={false}>Disabled</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Leave Request Alerts" name="leaveAlerts" initialValue={true} valuePropName="checked">
            <Select>
              <Option value={true}>Enabled</Option>
              <Option value={false}>Disabled</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Order Notifications" name="orderNotifications" initialValue={true} valuePropName="checked">
            <Select>
              <Option value={true}>Enabled</Option>
              <Option value={false}>Disabled</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Save Changes
          </Button>
        </Form>
      ),
    },
    {
      key: 'hr',
      label: 'HR Settings',
      children: (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Default Leave Days Per Year" name="leaveDays" initialValue={21}>
            <InputNumber min={0} max={50} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Work Hours Per Day" name="workHours" initialValue={8}>
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Work Week Start" name="weekStart" initialValue="MONDAY">
            <Select>
              <Option value="MONDAY">Monday</Option>
              <Option value="SUNDAY">Sunday</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            Save Changes
          </Button>
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
