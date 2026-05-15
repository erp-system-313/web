import { useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, Form, Input, Tag, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "../../../hooks/useAdmin";
import styles from "./Roles.module.css";

const { Title } = Typography;

export const RolesList: React.FC = () => {
  const { data: roles, loading, refetch } = useRoles();
  const { create, loading: creating } = useCreateRole();
  const { update, loading: updating } = useUpdateRole();
  const { remove, loading: deleting } = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await update(editingRole.id, values);
        message.success("Role updated");
      } else {
        await create(values);
        message.success("Role created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingRole(null);
      refetch();
    } catch {
      message.error("Failed to save role");
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (name === "ADMIN" || name === "MANAGER" || name === "STAFF") {
      message.warning("System roles cannot be deleted");
      return;
    }
    Modal.confirm({
      title: "Delete Role",
      content: `Are you sure you want to delete "${name}"?`,
      onOk: async () => {
        try {
          await remove(id);
          message.success("Role deleted");
          refetch();
        } catch {
          message.error("Failed to delete role");
        }
      },
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", render: (v: string) => <Tag color={v === "ADMIN" ? "red" : v === "MANAGER" ? "blue" : "default"}>{v}</Tag> },
    { title: "Description", dataIndex: "description", key: "description", render: (v: string) => v || "-" },
    { title: "System", dataIndex: "isSystem", key: "isSystem", render: (v: boolean) => v ? <Tag color="blue">System</Tag> : <Tag>Custom</Tag> },
    {
      title: "Actions", key: "actions", width: 160,
      render: (_: unknown, record: { id: number; name: string; description?: string; isSystem?: boolean }) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} disabled={record.isSystem} onClick={() => { setEditingRole(record); form.setFieldsValue(record); setModalOpen(true); }} />
          <Button type="link" danger icon={<DeleteOutlined />} disabled={record.isSystem} onClick={() => handleDelete(record.id, record.name)} loading={deleting} />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Roles & Permissions</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); form.resetFields(); setModalOpen(true); }}>Add Role</Button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : (
          <Table dataSource={roles} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <Modal title={editingRole ? "Edit Role" : "Add Role"} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRole(null); }} confirmLoading={creating || updating}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. HR_MANAGER" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe this role" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesList;
