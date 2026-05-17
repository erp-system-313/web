import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  Switch,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { usersService } from "../../../services/usersService";
import type { User } from "../../../services/usersService";
import { useRoles } from "../../../hooks/useAdmin";
import styles from "./Users.module.css";

const { Title } = Typography;

export const UsersListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data: roles } = useRoles();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersService.getAll();
      setUsers(response.content);
      setTotal(response.totalElements);
    } catch (err) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.firstName || "").toLowerCase().includes(q) ||
      (u.lastName || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.roleName || "").toLowerCase().includes(q)
    );
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingUser) {
        await usersService.update(editingUser.id, values);
        message.success("User updated successfully");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, ...values, roleName: u.roleName }
              : u,
          ),
        );
      } else {
        const { isActive, ...createValues } = values;
        await usersService.create(createValues);
        message.success("User created successfully");
        await fetchUsers();
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      message.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          await usersService.delete(id);
          message.success("User deleted successfully");
          setUsers((prev) => prev.filter((u) => u.id !== id));
          setTotal((prev) => prev - 1);
        } catch (error) {
          message.error("Failed to delete user");
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <strong>
          {record.firstName} {record.lastName}
        </strong>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: (roleName: string) => {
        const color =
          roleName === "ADMIN"
            ? "red"
            : roleName === "MANAGER"
              ? "blue"
              : "default";
        return <Tag color={color}>{roleName}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>User Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              form.setFieldsValue({ isActive: true });
              setIsModalOpen(true);
            }}
          >
            Add User
          </Button>
        </div>

        <Input
          placeholder="Search users..."
          prefix={<UserOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={filteredUsers}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              total,
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingUser(null);
        }}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersListPage;
