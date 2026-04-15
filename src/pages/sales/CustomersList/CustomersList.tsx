import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Select, Modal, message } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { DataTable, StatusBadge } from "../../../components/common";
import { useCustomers } from "../../../hooks";
import type { Customer, CustomerFilters } from "../../../types/sales";
import styles from "./CustomersList.module.css";

const { confirm } = Modal;

export const CustomersList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();

  const filters: CustomerFilters = useMemo(
    () => ({
      search: search || undefined,
      isActive: statusFilter,
    }),
    [search, statusFilter],
  );

  const { data, loading, total, refetch } = useCustomers(filters);

  const handleDelete = (customer: Customer) => {
    confirm({
      title: "Delete Customer",
      content: `Are you sure you want to delete ${customer.name}?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        message.success(`Customer ${customer.name} deleted`);
        refetch();
      },
    });
  };

  const columns: ColumnsType<Customer> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string | null) => email || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string | null) => phone || "-",
    },
    {
      title: "Credit Limit",
      dataIndex: "creditLimit",
      key: "creditLimit",
      render: (limit: number) => `$${limit.toLocaleString()}`,
    },
    {
      title: "Payment Terms",
      dataIndex: "paymentTerms",
      key: "paymentTerms",
      render: (terms: string) => terms.replace("_", " "),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => <StatusBadge status={isActive} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Customer) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/sales/customers/${record.id}`)}
          />
          <Button type="text" icon={<EditOutlined />} />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Customers</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Customer
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRefresh={refetch}
        searchPlaceholder="Search customers..."
        onSearch={setSearch}
        actions={
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: true, label: "Active" },
              { value: false, label: "Inactive" },
            ]}
          />
        }
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `Total ${t} customers`,
        }}
      />
    </div>
  );
};

export default CustomersList;
