import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Table, Tag, Space, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { PurchaseOrderStatus } from '../../types/purchaseOrder.types';
import { useSuppliers } from '../../hooks/useSuppliers';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import styles from './SupplierDetailsPage.module.css';

const getStatusTag = (status: PurchaseOrderStatus) => {
  const colors: Record<PurchaseOrderStatus, string> = {
    DRAFT: 'default',
    SENT: 'processing',
    RECEIVED: 'green',
    PARTIAL: 'blue',
    CANCELLED: 'red',
  };
  return <Tag color={colors[status]}>{status}</Tag>;
};

export const SupplierDetailsPage: React.FC = () => {
  const { id: idStr } = useParams<{ id: string }>();
  const id = idStr ? Number(idStr) : undefined;
  const navigate = useNavigate();
  const {
    suppliers,
    loading: supplierLoading,
    fetchSuppliers,
    deleteSupplier,
  } = useSuppliers();
  const { orders, loading: ordersLoading, fetchOrders } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState("purchaseOrders");

  const supplier = suppliers.find((s) => s.id === Number(id));

  const loadData = useCallback(async () => {
    if (id) {
      await fetchSuppliers({}, 1);
      await fetchOrders({ supplierId: Number(id) }, 1);
    }
  }, [id, fetchSuppliers, fetchOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (supplierLoading) {
    return <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>;
  }

  if (!supplier) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>Supplier not found</div>
    );
  }

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Supplier",
      content: "Are you sure you want to delete this supplier?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await deleteSupplier(supplier.id);
        navigate("/purchasing/suppliers");
      },
    });
  };

  const handleCreatePO = () => {
    navigate(`/purchasing/orders/new?supplier=${id}`);
  };

  const handleBack = () => {
    navigate('/purchasing/suppliers');
  };

  const orderColumns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
    },
    {
      title: "Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      render: (_: unknown, record: any) => (
        <Button
          type="text"
          onClick={() => navigate(`/purchasing/orders/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "purchaseOrders",
      label: "Purchase Orders",
      children: (
        <div className={styles.tabContent}>
          <Table
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            loading={ordersLoading}
          />
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
          <Button
            icon={<EditOutlined />}
            onClick={() => message.info("Edit supplier form coming soon")}
          >
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleCreatePO}
          >
            Create Purchase Order
          </Button>
        </Space>
      </div>

      <div className={styles.infoGrid}>
        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Contact Information</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Contact:</span>{" "}
            {supplier.contactPerson}
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
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Details</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Payment Terms:</span> Net{" "}
            {supplier.paymentTerms}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Code:</span> {supplier.code}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tax ID:</span> {supplier.taxId}
          </div>
        </Card>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default SupplierDetailsPage;
