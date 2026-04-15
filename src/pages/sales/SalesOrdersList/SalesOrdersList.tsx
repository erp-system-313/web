import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Select, Modal, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { DataTable, StatusBadge } from "../../../components/common";
import { useSalesOrders } from "../../../hooks";
import type {
  SalesOrder,
  SalesOrderFilters,
  SalesOrderStatus,
} from "../../../types/sales";
import styles from "./SalesOrdersList.module.css";

const { confirm } = Modal;

export const SalesOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    SalesOrderStatus | undefined
  >();

  const filters: SalesOrderFilters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter,
    }),
    [search, statusFilter],
  );

  const { data, loading, total, refetch } = useSalesOrders(filters);

  const handleDelete = (order: SalesOrder) => {
    confirm({
      title: "Delete Order",
      content: `Are you sure you want to delete order ${order.orderNumber}?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        message.success(`Order ${order.orderNumber} deleted`);
        refetch();
      },
    });
  };

  const columns: ColumnsType<SalesOrder> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Required Date",
      dataIndex: "requiredDate",
      key: "requiredDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SalesOrderStatus) => <StatusBadge status={status} />,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: SalesOrder) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/sales/orders/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/sales/orders/${record.id}/edit`)}
          />
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
        <h1>Sales Orders</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/sales/orders/new")}
        >
          New Order
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRefresh={refetch}
        searchPlaceholder="Search orders..."
        onSearch={setSearch}
        actions={
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "SHIPPED", label: "Shipped" },
              { value: "INVOICED", label: "Invoiced" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        }
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `Total ${t} orders`,
        }}
      />
    </div>
  );
};

export default SalesOrdersList;
