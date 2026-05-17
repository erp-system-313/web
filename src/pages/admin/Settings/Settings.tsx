import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Tabs,
  message,
  Spin,
  Switch,
  Divider,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useSettings, useUpdateSettings } from "../../../hooks/useSettings";
import { apiClient } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";
import formStyles from "../../../components/common/FormCard/FormCard.module.css";

const { Title } = Typography;

export const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [notifForm] = Form.useForm();
  const [hrForm] = Form.useForm();
  const { data: settings, loading, refetch } = useSettings();
  const { update, loading: updating } = useUpdateSettings();

  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [hrLoading, setHrLoading] = useState(false);
  const [hrSaving, setHrSaving] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
    fetchHrSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotificationSettings = async () => {
    setNotifLoading(true);
    try {
      const res = await apiClient.get(endpoints.settings.notifications);
      notifForm.setFieldsValue(res.data.data);
    } catch (err) {
      console.error("Failed to load notification settings", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const fetchHrSettings = async () => {
    setHrLoading(true);
    try {
      const res = await apiClient.get(endpoints.settings.hr);
      hrForm.setFieldsValue(res.data.data);
    } catch (err) {
      console.error("Failed to load HR settings", err);
    } finally {
      setHrLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await update(values);
      message.success("Settings saved successfully");
      refetch();
    } catch (error) {
      message.error("Failed to save settings");
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    try {
      const values = await notifForm.validateFields();
      await apiClient.put(endpoints.settings.notifications, values);
      message.success("Notification settings saved");
    } catch {
      message.error("Failed to save notification settings");
    } finally {
      setNotifSaving(false);
    }
  };

  const handleSaveHr = async () => {
    setHrSaving(true);
    try {
      const values = await hrForm.validateFields();
      await apiClient.put(endpoints.settings.hr, values);
      message.success("HR settings saved");
    } catch {
      message.error("Failed to save HR settings");
    } finally {
      setHrSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={formStyles.container}>
        <Card>
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        </Card>
      </div>
    );
  }

  const tabItems = [
    {
      key: "general",
      label: "General",
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={settings || undefined}
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
            <InputNumber min={1} max={12} placeholder="1-12" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Timezone" name="timezone">
            <Input placeholder="UTC" />
          </Form.Item>
          <Form.Item label="Date Format" name="dateFormat">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={updating}
            icon={<SaveOutlined />}
          >
            Save Changes
          </Button>
        </Form>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      children: notifLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Form
          form={notifForm}
          layout="vertical"
          onFinish={handleSaveNotifications}
        >
          <Divider orientation="left">Email Notifications</Divider>
          <Form.Item name="emailEnabled" label="Enable Email Notifications" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="leaveRequestSubmitted" label="Leave Request Submitted" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="leaveRequestApproved" label="Leave Request Approved" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="leaveRequestRejected" label="Leave Request Rejected" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="attendanceReminder" label="Attendance Reminder" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="applicantReceived" label="Applicant Received" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={notifSaving}
            icon={<SaveOutlined />}
          >
            Save Notification Settings
          </Button>
        </Form>
      ),
    },
    {
      key: "hr",
      label: "HR Settings",
      children: hrLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Form
          form={hrForm}
          layout="vertical"
          onFinish={handleSaveHr}
        >
          <Divider orientation="left">Leave Defaults</Divider>
          <Form.Item name="defaultAnnualLeave" label="Default Annual Leave (days)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="defaultSickLeave" label="Default Sick Leave (days)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Divider orientation="left">Attendance</Divider>
          <Form.Item name="attendanceGraceMinutes" label="Attendance Grace Period (minutes)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="workDaysPerWeek" label="Work Days Per Week">
            <InputNumber min={1} max={7} style={{ width: "100%" }} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={hrSaving}
            icon={<SaveOutlined />}
          >
            Save HR Settings
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className={formStyles.container}>
      <Card>
        <Title level={3}>Company Settings</Title>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
