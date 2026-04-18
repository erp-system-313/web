import { useState } from 'react';
import { Table, Card, Typography, Button, Space, Tag, Input, Modal, Form, message, Spin } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../../hooks/useUsers';
import styles from './Users.module.css';

const { Title } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const UsersListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data: users, loading, total, refetch } = useUsers({ search });
  const { create, loading: creating } = useCreateUser();
  const { update, loading: updating } = useUpdateUser();
  const { remove, loading: deleting } = useDeleteUser();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await update(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await create(values);
        message.success('User created successfully');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      refetch();
    } catch (error) {
      message.error('Failed to save user');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user?',
      onOk: async () => {
        try {
          await remove(id);
          message.success('User deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete user');
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'ADMIN' ? 'red' : role === 'MANAGER' ? 'blue' : 'default';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
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
            loading={deleting}
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
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              total,
              showTotal: (total) => `Total ${total} users`
            }}
          />
        )}
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingUser(null);
        }}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          <Form.Item
            name="roleId"
            label="Role ID"
            rules={[{ required: true, message: 'Please enter role ID' }]}
          >
            <Input type="number" placeholder="Enter role ID (1=ADMIN, 2=MANAGER, 3=STAFF)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersListPage;