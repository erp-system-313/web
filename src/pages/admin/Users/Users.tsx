import { useState } from 'react';
import { Table, Card, Typography, Button, Space, Tag, Input } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './Users.module.css';

const { Title } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const UsersListPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const mockUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-01' },
    { id: 2, name: 'Manager User', email: 'manager@company.com', role: 'MANAGER', status: 'ACTIVE', createdAt: '2024-02-15' },
    { id: 3, name: 'Staff User', email: 'staff@company.com', role: 'STAFF', status: 'ACTIVE', createdAt: '2024-03-10' },
    { id: 4, name: 'John Doe', email: 'john@company.com', role: 'STAFF', status: 'INACTIVE', createdAt: '2024-01-20' },
    { id: 5, name: 'Jane Smith', email: 'jane@company.com', role: 'MANAGER', status: 'ACTIVE', createdAt: '2024-02-01' },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>User Management</Title>
          <Button type="primary" icon={<PlusOutlined />}>
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

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default UsersListPage;
