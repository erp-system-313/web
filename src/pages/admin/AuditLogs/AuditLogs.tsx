import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Input,
  Select,
  DatePicker,
  Tag,
  Spin,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuditLogs } from "../../../hooks/useAuditLogs";
import styles from "./AuditLogs.module.css";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<
    string | undefined
  >();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: logs,
    loading,
    total,
  } = useAuditLogs({
    page: page - 1,
    size: pageSize,
    entityType: entityTypeFilter,
  });

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.userEmail.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.ipAddress.toLowerCase().includes(q)
    );
  });

  const columns: ColumnsType<AuditLog> = [
    {
      title: "Timestamp",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "User",
      dataIndex: "userEmail",
      key: "userEmail",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => {
        const color =
          action === "CREATE"
            ? "green"
            : action === "UPDATE"
              ? "blue"
              : action === "DELETE"
                ? "red"
                : action === "LOGIN"
                  ? "purple"
                  : "default";
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: "Entity",
      dataIndex: "entityType",
      key: "entityType",
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
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
            placeholder="Filter by entity type"
            allowClear
            style={{ width: 150 }}
            value={entityTypeFilter}
            onChange={setEntityTypeFilter}
          >
            <Select.Option value="User">User</Select.Option>
            <Select.Option value="Order">Order</Select.Option>
            <Select.Option value="Product">Product</Select.Option>
            <Select.Option value="Inventory">Inventory</Select.Option>
          </Select>
          <RangePicker />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={filteredLogs}
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
              showTotal: (total) => `Total ${total} logs`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default AuditLogsPage;
