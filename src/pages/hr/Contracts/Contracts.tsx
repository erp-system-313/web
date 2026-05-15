import { useState } from "react";
import { Table, Card, Typography, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract, useEmployees } from "../../../hooks";
import type { ContractType, ContractStatus, Contract } from "../../../types/hr";
import dayjs from "dayjs";
import styles from "./Contracts.module.css";

const { Title } = Typography;
const { Option } = Select;

const contractTypes: ContractType[] = ["PERMANENT", "INTERNSHIP", "FIXED_TERM", "CONTRACTOR"];

const statusColors: Record<ContractStatus, string> = {
  ACTIVE: "green",
  EXPIRED: "default",
  TERMINATED: "red",
};

export const Contracts: React.FC = () => {
  const { data: contracts, loading, refetch } = useContracts();
  const { data: employees } = useEmployees();
  const { create, loading: creating } = useCreateContract();
  const { update, loading: updating } = useUpdateContract();
  const { remove } = useDeleteContract();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startDate: values.startDate?.format?.("YYYY-MM-DD") ?? values.startDate,
        endDate: values.endDate?.format?.("YYYY-MM-DD") ?? values.endDate,
      };
      if (editing) {
        await update(editing.id, payload);
        message.success("Contract updated");
      } else {
        await create(payload);
        message.success("Contract created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      refetch();
    } catch {
      message.error("Failed to save contract");
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Contract",
      content: "Are you sure?",
      onOk: async () => {
        await remove(id);
        message.success("Contract deleted");
        refetch();
      },
    });
  };

  const columns = [
    { title: "Employee", dataIndex: "employeeName", key: "employeeName" },
    { title: "Type", dataIndex: "type", key: "type", render: (v: string) => <Tag>{v.replace("_", " ")}</Tag> },
    { title: "Start", dataIndex: "startDate", key: "startDate" },
    { title: "End", dataIndex: "endDate", key: "endDate", render: (v: string) => v || "—" },
    { title: "Wage", dataIndex: "wage", key: "wage", render: (v: number) => v ? `$${v.toLocaleString()}` : "—" },
    { title: "Status", dataIndex: "status", key: "status", render: (v: ContractStatus) => <Tag color={statusColors[v]}>{v}</Tag> },
    {
      title: "Actions", key: "actions", width: 120,
      render: (_: unknown, r: Contract) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue({ ...r, startDate: r.startDate ? dayjs(r.startDate) : undefined, endDate: r.endDate ? dayjs(r.endDate) : undefined }); setModalOpen(true); }} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Contracts</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Contract</Button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : (
          <Table dataSource={contracts} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <Modal title={editing ? "Edit Contract" : "Add Contract"} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null); }} confirmLoading={creating || updating} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select employee" showSearch filterOption={(input, option) => (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())}>
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>{e.fullName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Contract Type" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select type">
              {contractTypes.map((t) => (
                <Option key={t} value={t}>{t.replace("_", " ")}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: "Required" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="wage" label="Wage (Annual)">
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Annual salary" />
          </Form.Item>
          <Form.Item name="benefits" label="Benefits">
            <Input.TextArea rows={2} placeholder="Health insurance, 401k, etc." />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Option value="ACTIVE">Active</Option>
                <Option value="EXPIRED">Expired</Option>
                <Option value="TERMINATED">Terminated</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Contracts;
