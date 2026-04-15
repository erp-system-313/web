import { useState } from 'react';
import { Table, Card, Typography, Input, Select, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './AuditLogs.module.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: number;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
}

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const mockLogs: AuditLog[] = [
    { id: 1, user: 'Admin User', action: 'CREATE', module: 'Employees', ipAddress: '192.168.1.1', timestamp: '2026-04-15 09:30:00' },
    { id: 2, user: 'Manager User', action: 'UPDATE', module: 'Leave Requests', ipAddress: '192.168.1.2', timestamp: '2026-04-15 10:15:00' },
    { id: 3, user: 'Staff User', action: 'LOGIN', module: 'Auth', ipAddress: '192.168.1.3', timestamp: '2026-04-15 08:00:00' },
    { id: 4, user: 'Admin User', action: 'DELETE', module: 'Products', ipAddress: '192.168.1.1', timestamp: '2026-04-14 14:20:00' },
    { id: 5, user: 'Manager User', action: 'APPROVE', module: 'Purchase Orders', ipAddress: '192.168.1.2', timestamp: '2026-04-14 16:45:00' },
    { id: 6, user: 'Staff User', action: 'VIEW', module: 'Dashboard', ipAddress: '192.168.1.3', timestamp: '2026-04-14 09:00:00' },
    { id: 7, user: 'Admin User', action: 'UPDATE', module: 'Settings', ipAddress: '192.168.1.1', timestamp: '2026-04-13 11:30:00' },
    { id: 8, user: 'Manager User', action: 'CREATE', module: 'Sales Orders', ipAddress: '192.168.1.2', timestamp: '2026-04-13 13:00:00' },
  ];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = !search || 
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => a.timestamp.localeCompare(b.timestamp),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const color = action === 'CREATE' ? 'green' : action === 'UPDATE' ? 'blue' : action === 'DELETE' ? 'red' : 'default';
        return <span style={{ color, fontWeight: 500 }}>{action}</span>;
      },
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <Title level={3}>Audit Logs</Title>

        <div className={styles.filters}>
          <Input
            placeholder="Search user or module..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by action"
            allowClear
            style={{ width: 150 }}
            value={actionFilter}
            onChange={setActionFilter}
          >
            <Select.Option value="CREATE">CREATE</Select.Option>
            <Select.Option value="UPDATE">UPDATE</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="VIEW">VIEW</Select.Option>
            <Select.Option value="LOGIN">LOGIN</Select.Option>
            <Select.Option value="APPROVE">APPROVE</Select.Option>
          </Select>
          <RangePicker />
        </div>

        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AuditLogsPage;
