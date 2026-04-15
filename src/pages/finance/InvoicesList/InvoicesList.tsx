import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Select, message } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  FilePdfOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { DataTable, StatusBadge } from "../../../components/common";
import { useInvoices } from "../../../hooks";
import type {
  Invoice,
  InvoiceFilters,
  InvoiceStatus,
} from "../../../types/finance";
import styles from "./InvoicesList.module.css";

export const InvoicesList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();

  const filters: InvoiceFilters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter,
    }),
    [search, statusFilter],
  );

  const { data, loading, total, refetch } = useInvoices(filters);

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: InvoiceStatus) => <StatusBadge status={status} />,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Balance",
      dataIndex: "balanceDue",
      key: "balanceDue",
      render: (balance: number) => (
        <span style={{ color: balance > 0 ? "#ff4d4f" : "#52c41a" }}>
          ${balance.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: unknown, record: Invoice) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/finance/invoices/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/finance/invoices/${record.id}/edit`)}
            disabled={record.status === "PAID" || record.status === "CANCELLED"}
          />
          <Button
            type="text"
            icon={<DollarOutlined />}
            onClick={() => navigate(`/finance/invoices/${record.id}`)}
            disabled={record.balanceDue === 0}
          />
          <Button
            type="text"
            icon={<FilePdfOutlined />}
            onClick={() => message.info("PDF generation coming soon")}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Invoices</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/finance/invoices/new")}
        >
          New Invoice
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRefresh={refetch}
        searchPlaceholder="Search invoices..."
        onSearch={setSearch}
        actions={
          <Space>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 140 }}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "SENT", label: "Sent" },
                { value: "PAID", label: "Paid" },
                { value: "OVERDUE", label: "Overdue" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </Space>
        }
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `Total ${t} invoices`,
        }}
      />
    </div>
  );
};

export default InvoicesList;
