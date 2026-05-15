import { useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, Input, InputNumber, Select, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useJobPositions, useCreateJobPosition, useUpdateJobPosition, useDeleteJobPosition } from "../../../hooks/useJobPositions";
import { useDepartments } from "../../../hooks/useDepartments";
import type { JobPosition } from "../../../types/hr";
import styles from "./JobPositions.module.css";

const { Title } = Typography;
const { Option } = Select;

export const JobPositions: React.FC = () => {
  const { data: positions, loading, refetch } = useJobPositions();
  const { data: departments } = useDepartments();
  const { create } = useCreateJobPosition();
  const { update } = useUpdateJobPosition();
  const { delete: deletePos } = useDeleteJobPosition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobPosition | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (pos: JobPosition) => {
    setEditing(pos);
    form.setFieldsValue(pos);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await update(editing.id, values);
        message.success("Job position updated");
      } else {
        await create(values);
        message.success("Job position created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      refetch();
    } catch (err) {
      message.error(editing ? "Failed to update job position" : "Failed to create job position");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Job Position",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await deletePos(id);
          message.success("Job position deleted");
          refetch();
        } catch {
          message.error("Failed to delete job position");
        }
      },
    });
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Department", dataIndex: "departmentName", key: "departmentName", render: (v: string) => v || "-" },
    { title: "Expected Employees", dataIndex: "expectedEmployees", key: "expectedEmployees", render: (v: number) => v ?? "-" },
    {
      title: "Actions", key: "actions", width: 150,
      render: (_: unknown, record: JobPosition) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className={styles.header}>
        <Title level={3}>Job Positions</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Add Position</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Table dataSource={positions} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      )}
      <Modal
        title={editing ? "Edit Job Position" : "Add Job Position"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null); }}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Job title" />
          </Form.Item>
          <Form.Item name="departmentId" label="Department">
            <Select placeholder="Select department" allowClear>
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="expectedEmployees" label="Expected Employees">
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Number of employees" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Job description" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default JobPositions;
