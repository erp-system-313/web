import { useState } from 'react';
import { Table, Card, Typography, Input, Select, DatePicker, Tag, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import styles from './AuditLogs.module.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: logs, loading, total } = useAuditLogs({
    page: page - 1,
    size: pageSize,
    action: actionFilter,
  });

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const color = action === 'CREATE' ? 'green' : action === 'UPDATE' ? 'blue' : action === 'DELETE' ? 'red' : action === 'LOGIN' ? 'purple' : 'default';
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
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
            placeholder="Search..."
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={logs}
            columns={columns}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showTotal: (total) => `Total ${total} logs`
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default AuditLogsPage;