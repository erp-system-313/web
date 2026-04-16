import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Tag, Space, Input, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderFilters } from '../../types/purchaseOrder.types';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import styles from './PurchaseOrderListPage.module.css';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusTag = (status: PurchaseOrderStatus) => {
  const colors: Record<PurchaseOrderStatus, string> = {
    draft: 'default',
    submitted: 'processing',
    confirmed: 'blue',
    shipped: 'orange',
    delivered: 'green',
    cancelled: 'red',
  };
  return <Tag color={colors[status]}>{status}</Tag>;
};

export const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, deleteOrder } = usePurchaseOrders();
  
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [searchText, setSearchText] = useState('');

  const loadOrders = useCallback(async () => {
    await fetchOrders({
      status: statusFilter || undefined,
      search: searchText,
    }, 1);
  }, [fetchOrders, statusFilter, searchText]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as PurchaseOrderStatus | '');
  };

  const handleCreatePO = () => {
    navigate('/purchasing/orders/new');
  };

  const handleViewOrder = (id: string) => {
    navigate(`/purchasing/orders/${id}`);
  };

  const handleEditOrder = (id: string) => {
    navigate(`/purchasing/orders/${id}/edit`);
  };

  const handleDeleteOrder = (id: string) => {
    Modal.confirm({
      title: 'Delete Purchase Order',
      content: 'Are you sure you want to delete this purchase order?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteOrder(id);
      },
    });
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (poNumber: string) => <strong>{poNumber}</strong>,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: PurchaseOrderStatus) => getStatusTag(status),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PurchaseOrder) => (
        <Space className={styles.tableActions}>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewOrder(record.id)} />
          {record.status === 'draft' && (
            <>
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEditOrder(record.id)} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteOrder(record.id)} />
            </>
          )}
        </Space>
      ),
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
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            options={statusOptions}
            onChange={handleStatusFilter}
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
          No purchase orders found. Click "Create Purchase Order" to get started.
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderListPage;
