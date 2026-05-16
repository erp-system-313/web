import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Select, Table, Tag, Space, Input, Modal } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { PurchaseOrderStatus } from "../../types/purchaseOrder.types";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";
import styles from "./PurchaseOrderListPage.module.css";

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const getStatusTag = (status: PurchaseOrderStatus) => {
  const colors: Record<PurchaseOrderStatus, string> = {
    DRAFT: 'default',
    SENT: 'processing',
    RECEIVED: 'green',
    PARTIAL: 'blue',
    CANCELLED: 'red',
    PENDING: 'default',
    APPROVED: 'processing',
  };
  return <Tag color={colors[status]}>{status}</Tag>;
};

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, deleteOrder, cancelOrder } = usePurchaseOrders();

  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [searchText, setSearchText] = useState('');

  const loadOrders = useCallback(async () => {
    await fetchOrders(
      {
        status: (statusFilter || undefined) as PurchaseOrderStatus | undefined,
        search: searchText || undefined,
      },
      1,
    );
  }, [fetchOrders, statusFilter, searchText]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCreatePO = () => {
    navigate("/purchasing/orders/new");
  };

  const handleViewOrder = (id: number) => {
    navigate(`/purchasing/orders/${id}`);
  };

  const handleEditOrder = (id: number) => {
    navigate(`/purchasing/orders/${id}/edit`);
  };

  const handleDeleteOrder = (id: number) => {
    Modal.confirm({
      title: "Delete Purchase Order",
      content: "Are you sure you want to delete this purchase order?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await deleteOrder(id);
      },
    });
  };

  const handleCancelOrder = (id: number) => {
    Modal.confirm({
      title: "Cancel Purchase Order",
      content: "Are you sure you want to cancel this purchase order? This cannot be undone.",
      okText: "Cancel Order",
      okType: "danger",
      onOk: async () => {
        await cancelOrder(id);
      },
    });
  };

  const handleReceiveOrder = (id: number) => {
    navigate(`/purchasing/orders/${id}`);
  };

  const columns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
      render: (poNumber: string) => <strong>{poNumber}</strong>,
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expected Date',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: PurchaseOrderStatus) => getStatusTag(status),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${(amount ?? 0).toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => {
        const canEdit = record.status === 'DRAFT';
        const canReceive = record.status === 'SENT' || record.status === 'APPROVED' || record.status === 'PARTIAL';
        const canCancel = record.status === 'DRAFT' || record.status === 'SENT' || record.status === 'APPROVED' || record.status === 'PARTIAL';
        return (
          <Space className={styles.tableActions}>
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewOrder(record.id)} />
            {canEdit && (
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEditOrder(record.id)} />
            )}
            {canReceive && (
              <Button type="text" icon={<CheckCircleOutlined />} onClick={() => handleReceiveOrder(record.id)} />
            )}
            {canCancel && (
              <Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => handleCancelOrder(record.id)} />
            )}
            {canEdit && (
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteOrder(record.id)} />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Purchase Orders</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePO}>
          Create Purchase Order
        </Button>
      </div>

      <Card className={styles.filterBar}>
        <Space size="large" wrap>
          <Input.Search
            placeholder="Search by PO number or supplier..."
            allowClear
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            style={{ width: 160 }}
            options={statusOptions}
            onChange={(value) =>
              setStatusFilter((value ?? '') as PurchaseOrderStatus | '')
            }
            value={statusFilter}
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} orders`,
        }}
      />

      {orders.length === 0 && !loading && (
        <div className={styles.emptyState}>
          No purchase orders found. Click "Create Purchase Order" to get
          started.
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderListPage;
