import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Select, Table, Tag, Space, Input, message } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSuppliers } from "../../hooks/useSuppliers";
import styles from "./SupplierListPage.module.css";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const paymentTermsLabels: Record<number, string> = {
  30: "Net 30",
  60: "Net 60",
  90: "Net 90",
};

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading, fetchSuppliers } = useSuppliers();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers(
      {
        status: statusFilter || undefined,
        search: searchText,
      },
      1,
    );
  }, [fetchSuppliers, statusFilter, searchText]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleViewSupplier = (id: number) => {
    navigate(`/purchasing/suppliers/${id}`);
  };

  const handleCreatePO = (supplierId: number) => {
    navigate(`/purchasing/orders/new?supplier=${supplierId}`);
  };

  const handleAddSupplier = () => {
    message.info("Add supplier form coming soon");
  };

  const listColumns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Payment Terms",
      dataIndex: "paymentTerms",
      key: "paymentTerms",
      render: (terms: number) => paymentTermsLabels[terms] || `Net ${terms}`,
    },
    {
      title: "Total Purchased",
      dataIndex: "totalPurchased",
      key: "totalPurchased",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => (
        <Space className={styles.tableActions}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSupplier(record.id)}
          />
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleCreatePO(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Suppliers</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSupplier}
        >
          Add Supplier
        </Button>
      </div>

      <Card className={styles.filterBar}>
        <Space size="large" wrap>
          <Input.Search
            placeholder="Search suppliers..."
            allowClear
            prefix={<SearchOutlined />}
            onSearch={setSearchText}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            options={statusOptions}
            onChange={setStatusFilter}
          />
        </Space>
      </Card>

      <Table
        columns={listColumns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} suppliers`,
        }}
      />

      {suppliers.length === 0 && !loading && (
        <div className={styles.emptyState}>
          No suppliers found. Click "Add Supplier" to create one.
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
