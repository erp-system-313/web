import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Tag, Space, Input, Modal, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderFilters } from '../../types/purchaseOrder.types';
import styles from './PurchaseOrderListPage.module.css';

interface UsePurchaseOrdersReturn {
  orders: PurchaseOrder[];
  loading: boolean;
  fetchOrders: (filters: PurchaseOrderFilters, page: number) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

const usePurchaseOrders = (): UsePurchaseOrdersReturn => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const mockOrders: PurchaseOrder[] = [
    {
      id: '1',
      poNumber: 'PO-2024-001',
      supplierId: '1',
      supplierName: 'TechSupply Co.',
      orderDate: '2024-01-15T10:00:00Z',
      deliveryDate: '2024-01-25T10:00:00Z',
      status: 'delivered',
      paymentTerms: 'Net 30',
      notes: 'Urgent order',
      items: [],
      subtotal: 1500.00,
      taxAmount: 150.00,
      shippingCost: 50.00,
      totalAmount: 1700.00,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      poNumber: 'PO-2024-002',
      supplierId: '2',
      supplierName: 'Global Parts Ltd.',
      orderDate: '2024-01-16T10:00:00Z',
      deliveryDate: '2024-01-30T10:00:00Z',
      status: 'shipped',
      paymentTerms: 'Net 60',
      notes: '',
      items: [],
      subtotal: 2500.00,
      taxAmount: 250.00,
      shippingCost: 75.00,
      totalAmount: 2825.00,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: '3',
      poNumber: 'PO-2024-003',
      supplierId: '3',
      supplierName: 'Quality Electronics',
      orderDate: '2024-01-17T10:00:00Z',
      deliveryDate: '2024-01-28T10:00:00Z',
      status: 'confirmed',
      paymentTerms: 'Net 30',
      notes: 'Handle with care',
      items: [],
      subtotal: 3200.00,
      taxAmount: 320.00,
      shippingCost: 100.00,
      totalAmount: 3620.00,
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
    },
    {
      id: '4',
      poNumber: 'PO-2024-004',
      supplierId: '1',
      supplierName: 'TechSupply Co.',
      orderDate: '2024-01-18T10:00:00Z',
      deliveryDate: '2024-02-01T10:00:00Z',
      status: 'draft',
      paymentTerms: 'Net 30',
      notes: '',
      items: [],
      subtotal: 800.00,
      taxAmount: 80.00,
      shippingCost: 50.00,
      totalAmount: 930.00,
      createdAt: '2024-01-18T10:00:00Z',
      updatedAt: '2024-01-18T10:00:00Z',
    },
    {
      id: '5',
      poNumber: 'PO-2024-005',
      supplierId: '4',
      supplierName: 'Office Solutions Inc.',
      orderDate: '2024-01-19T10:00:00Z',
      deliveryDate: '2024-01-26T10:00:00Z',
      status: 'cancelled',
      paymentTerms: 'COD',
      notes: 'Cancelled due to budget constraints',
      items: [],
      subtotal: 450.00,
      taxAmount: 45.00,
      shippingCost: 25.00,
      totalAmount: 520.00,
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-19T10:00:00Z',
    },
  ];

  const fetchOrders = useCallback(async (filters: PurchaseOrderFilters, _page: number) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockOrders];
    
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(o => 
        o.poNumber.toLowerCase().includes(search) || 
        o.supplierName.toLowerCase().includes(search)
      );
    }

    setOrders(filtered);
    setLoading(false);
  }, []);

  const deleteOrder = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setOrders(prev => prev.filter(o => o.id !== id));
    message.success('Purchase order deleted successfully');
  };

  return { orders, loading, fetchOrders, deleteOrder };
};

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
