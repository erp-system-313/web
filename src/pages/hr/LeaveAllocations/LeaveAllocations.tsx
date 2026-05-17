import { useState, useEffect } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, InputNumber, Select, DatePicker, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLeaveBalances, useAllocateLeave, useEmployees } from "../../../hooks";
import type { LeaveBalance, LeaveType } from "../../../types/hr";
import dayjs from "dayjs";
import styles from "./LeaveAllocations.module.css";

const { Title } = Typography;
const { Option } = Select;

const leaveTypes: LeaveType[] = ["ANNUAL", "SICK", "PERSONAL", "UNPAID", "MATERNITY", "PATERNITY"];

export const LeaveAllocations: React.FC = () => {
  const { data: balances, loading, refetch } = useLeaveBalances();
  const { data: employees } = useEmployees();
  const { allocate, loading: allocating } = useAllocateLeave();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: "Employee", dataIndex: "employeeName", key: "employeeName" },
    { title: "Leave Type", dataIndex: "type", key: "type" },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "Total Days", dataIndex: "totalDays", key: "totalDays" },
    { title: "Used Days", dataIndex: "usedDays", key: "usedDays" },
    {
      title: "Remaining",
      dataIndex: "remainingDays",
      key: "remainingDays",
      render: (v: number) => <span style={{ color: v > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>{v}</span>,
    },
  ];

  const handleAllocate = async () => {
    try {
      const values = await form.validateFields();
      await allocate({
        employeeId: values.employeeId,
        type: values.type,
        totalDays: values.totalDays,
        year: values.year || dayjs().year(),
      });
      message.success("Leave allocated");
      setModalOpen(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Failed to allocate leave");
    }
  };

  return (
    <Card>
      <div className={styles.header}>
        <Title level={3}>Leave Allocations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          Allocate Leave
        </Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Table dataSource={balances} columns={columns} rowKey={(r: LeaveBalance) => `${r.employeeId}-${r.type}-${r.year}`} pagination={{ pageSize: 10 }} />
      )}
      <Modal title="Allocate Leave" open={modalOpen} onOk={handleAllocate} onCancel={() => { setModalOpen(false); form.resetFields(); }} confirmLoading={allocating}>
        <Form form={form} layout="vertical">
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select employee" showSearch filterOption={(input, option) => (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())}>
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>{e.fullName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Leave Type" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select type">
              {leaveTypes.map((t) => (
                <Option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="totalDays" label="Total Days" rules={[{ required: true, message: "Required" }]}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Number of days" />
          </Form.Item>
          <Form.Item name="year" label="Year" initialValue={dayjs().year()}>
            <InputNumber min={2020} max={2035} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default LeaveAllocations;
