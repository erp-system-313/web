import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Button, Input, Select, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTickets } from "../../../hooks/useSupport";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../../../types/support";
import styles from "./TicketsList.module.css";

const { Title } = Typography;

const priorityColors: Record<TicketPriority, string> = {
  LOW: "green",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const statusColors: Record<TicketStatus, string> = {
  OPEN: "default",
  IN_PROGRESS: "processing",
  RESOLVED: "success",
  CLOSED: "default",
};

export const TicketsList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [page, setPage] = useState(0);

  const filters: {
    page: number;
    size: number;
    search?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
  } = {
    page,
    size: 20,
  };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter as TicketStatus;
  if (priorityFilter) filters.priority = priorityFilter as TicketPriority;

  const { data, total, loading } = useTickets(
    search || statusFilter || priorityFilter ? filters : { page, size: 20 },
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: TicketPriority) => (
        <Tag color={priorityColors[priority]}>{priority}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TicketStatus) => (
        <Tag color={statusColors[status]}>{status.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedToName",
      key: "assignedToName",
      render: (name: string | undefined) => name || "-",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Title level={3}>Support Tickets</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/support/tickets/new")}
        >
          New Ticket
        </Button>
      </div>

      <Space className={styles.filters}>
        <Input.Search
          placeholder="Search tickets..."
          allowClear
          onSearch={(value) => {
            setSearch(value);
            setPage(0);
          }}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 140 }}
          onChange={(value) => {
            setStatusFilter(value || "");
            setPage(0);
          }}
          options={[
            { value: "OPEN", label: "Open" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "CLOSED", label: "Closed" },
          ]}
        />
        <Select
          placeholder="Priority"
          allowClear
          style={{ width: 140 }}
          onChange={(value) => {
            setPriorityFilter(value || "");
            setPage(0);
          }}
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "URGENT", label: "Urgent" },
          ]}
        />
      </Space>

      <Table<Ticket>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page + 1,
          total,
          pageSize: 20,
          onChange: (p) => setPage(p - 1),
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/support/tickets/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default TicketsList;
