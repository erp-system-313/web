import { useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, Input, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "../../../hooks/useDepartments";
import type { Department } from "../../../types/hr";
import styles from "./Departments.module.css";

const { Title } = Typography;

export const Departments: React.FC = () => {
  const { data: departments, loading, refetch } = useDepartments();
  const { create } = useCreateDepartment();
  const { update } = useUpdateDepartment();
  const { delete: deleteDept } = useDeleteDepartment();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditing(dept);
    form.setFieldsValue(dept);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await update(editing.id, values);
        message.success("Department updated");
      } else {
        await create(values);
        message.success("Department created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      refetch();
    } catch (err) {
      message.error(editing ? "Failed to update department" : "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Department",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await deleteDept(id);
          message.success("Department deleted");
          refetch();
        } catch {
          message.error("Failed to delete department");
        }
      },
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Parent Department", dataIndex: "parentName", key: "parentName", render: (v: string) => v || "-" },
    { title: "Manager", dataIndex: "managerName", key: "managerName", render: (v: string) => v || "-" },
    {
      title: "Actions", key: "actions", width: 150,
      render: (_: unknown, record: Department) => (
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
        <Title level={3}>Departments</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>Add Department</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : (
        <Table dataSource={departments} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      )}
      <Modal
        title={editing ? "Edit Department" : "Add Department"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditing(null); }}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Department name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Description" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Departments;
