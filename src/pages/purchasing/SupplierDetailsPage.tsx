import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Table, Tag, Space, Progress, Statistic, Row, Col, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { Supplier } from '../../types/supplier.types';
import type { PurchaseOrder, PurchaseOrderStatus } from '../../types/purchaseOrder.types';
import styles from './SupplierDetailsPage.module.css';

interface UseSupplierReturn {
  supplier: Supplier | null;
  loading: boolean;
  fetchSupplier: (id: string) => Promise<void>;
}

const useSupplier = (): UseSupplierReturn => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSupplier = async (id: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockSupplier: Supplier = {
      id,
      name: 'TechSupply Co.',
      contactPerson: 'John Smith',
      email: 'john@techsupply.com',
      phone: '+1 555-0101',
      address: '123 Tech Street, Suite 100',
      city: 'San Francisco',
      country: 'USA',
      paymentTerms: 'Net 30',
      rating: 5,
      totalOrders: 45,
      onTimeDelivery: 98,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };
    
    setSupplier(mockSupplier);
    setLoading(false);
  };

  return { supplier, loading, fetchSupplier };
};

interface UsePurchaseOrdersReturn {
  orders: PurchaseOrder[];
  fetchOrders: (filters: { supplierId: string }) => Promise<void>;
}

const usePurchaseOrders = (): UsePurchaseOrdersReturn => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

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
      notes: '',
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
      supplierId: '1',
      supplierName: 'TechSupply Co.',
      orderDate: '2024-01-16T10:00:00Z',
      deliveryDate: '2024-01-30T10:00:00Z',
      status: 'shipped',
      paymentTerms: 'Net 30',
      notes: '',
      items: [],
      subtotal: 2500.00,
      taxAmount: 250.00,
      shippingCost: 75.00,
      totalAmount: 2825.00,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
  ];

  const fetchOrders = async (filters: { supplierId: string }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setOrders(mockOrders.filter(o => o.supplierId === filters.supplierId));
  };

  return { orders, fetchOrders };
};

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

export const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supplier, loading: supplierLoading, fetchSupplier } = useSupplier();
  const { orders, fetchOrders } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState('purchaseOrders');

  const loadData = useCallback(async () => {
    if (id) {
      await fetchSupplier(id);
      await fetchOrders({ supplierId: id });
    }
  }, [id, fetchSupplier, fetchOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePO = () => {
    navigate(`/purchasing/orders/new?supplier=${id}`);
  };

  const handleEdit = () => {
    navigate(`/purchasing/suppliers/${id}/edit`);
    message.info('Edit supplier form coming soon');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Supplier',
      content: 'Are you sure you want to delete this supplier?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        message.success('Supplier deleted successfully');
        navigate('/purchasing/suppliers');
      },
    });
  };

  const handleBack = () => {
    navigate('/purchasing/suppliers');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/purchasing/orders/${orderId}`);
  };

  const orderColumns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
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
        <Button type="text" onClick={() => handleViewOrder(record.id)}>View</Button>
      ),
    },
  ];

  if (supplierLoading) {
    return <div style={{ textAlign: 'center', padding: 48 }}>Loading...</div>;
  }

  if (!supplier) {
    return <div style={{ textAlign: 'center', padding: 48 }}>Supplier not found</div>;
  }

  const tabItems = [
    {
      key: 'purchaseOrders',
      label: 'Purchase Orders',
      children: (
        <div className={styles.tabContent}>
          <Table
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: (
        <div className={styles.tabContent}>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Delivery Performance">
                <Progress 
                  percent={supplier.onTimeDelivery} 
                  status="active"
                  strokeColor="#52c41a"
                />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <span style={{ color: '#999' }}>On-Time Delivery Rate</span>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Order Volume">
                <Statistic value={supplier.totalOrders} />
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ color: '#999' }}>Total Orders</span>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <div className={styles.backLink} onClick={handleBack}>
            <ArrowLeftOutlined /> Back to Suppliers
          </div>
          <h1 className={styles.title}>{supplier.name}</h1>
        </div>
        <Space className={styles.headerActions}>
          <Button icon={<EditOutlined />} onClick={handleEdit}>Edit</Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>Delete</Button>
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleCreatePO}>
            Create Purchase Order
          </Button>
        </Space>
      </div>

      <div className={styles.infoGrid}>
        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Contact Information</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Contact:</span> {supplier.contactPerson}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span> {supplier.email}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone:</span> {supplier.phone}
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Address</div>
          <div className={styles.infoRow}>{supplier.address}</div>
          <div className={styles.infoRow}>{supplier.city}, {supplier.country}</div>
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Performance</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Payment Terms:</span> {supplier.paymentTerms}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Rating:</span>{' '}
            <span className={styles.rating}>{'★'.repeat(supplier.rating)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total Orders:</span> {supplier.totalOrders}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>On-Time:</span> {supplier.onTimeDelivery}%
          </div>
        </Card>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default SupplierDetailsPage;
