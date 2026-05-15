import { useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useJobOpenings, useCreateJobOpening, useUpdateJobOpening, useDeleteJobOpening } from "../../../hooks/useRecruitment";
import { useDepartments } from "../../../hooks";
import type { JobOpening } from "../../../types/recruitment";
import styles from "./JobOpenings.module.css";

const { Title } = Typography;
const { Option } = Select;

export const JobOpenings: React.FC = () => {
  const { data: openings, loading, refetch } = useJobOpenings();
  const { data: departments } = useDepartments();
  const { create } = useCreateJobOpening();
  const { update } = useUpdateJobOpening();
  const { delete: deleteJo } = useDeleteJobOpening();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobOpening | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (jo: JobOpening) => {
    setEditing(jo);
    form.setFieldsValue(jo);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await update(editing.id, values);
        message.success("Job opening updated");
      } else {
        await create(values);
        message.success("Job opening created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      refetch();
    } catch {
      message.error(editing ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Job Opening",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await deleteJo(id);
          message.success("Deleted");
          refetch();
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Department", dataIndex: "departmentName", key: "departmentName", render: (v: string) => v || "-" },
    { title: "Expected Salary", dataIndex: "expectedSalary", key: "expectedSalary", render: (v: number) => v ? `$${v.toLocaleString()}` : "-" },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (s: string) => {
        const color = s === "OPEN" ? "green" : s === "CLOSED" ? "default" : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions", key: "actions", width: 150,
      render: (_: unknown, record: JobOpening) => (
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
        <Title level={3}>Job Openings</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Add Opening</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Table dataSource={openings} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      )}
      <Modal
        title={editing ? "Edit Job Opening" : "Add Job Opening"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null); }}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. Senior Software Engineer" />
          </Form.Item>
          <Form.Item name="departmentId" label="Department">
            <Select placeholder="Select department" allowClear>
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="expectedSalary" label="Expected Salary">
            <InputNumber min={0} style={{ width: "100%" }} prefix="$" placeholder="Annual salary" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select status">
              <Option value="OPEN">Open</Option>
              <Option value="CLOSED">Closed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Job description" />
          </Form.Item>
          <Form.Item name="requirements" label="Requirements">
            <Input.TextArea rows={4} placeholder="Job requirements" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default JobOpenings;
