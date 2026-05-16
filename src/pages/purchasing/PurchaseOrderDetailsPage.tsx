import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Descriptions, Table, Tag, Button, Spin, Select, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, EditOutlined } from "@ant-design/icons";
import type { PurchaseOrder, PurchaseOrderStatus } from "../../types/purchaseOrder.types";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";

const statusColors: Record<string, string> = {
  DRAFT: "default",
  SENT: "processing",
  RECEIVED: "green",
  PARTIAL: "blue",
  CANCELLED: "red",
  PENDING: "default",
  APPROVED: "processing",
};

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PurchaseOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getOrder, updateOrder } = usePurchaseOrders();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<PurchaseOrderStatus | ''>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(location.pathname.endsWith('/edit'));
  }, [location.pathname]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(Number(id)).then((data) => {
      setOrder(data);
      if (data) setEditStatus(data.status);
      setLoading(false);
    });
  }, [id, getOrder]);

  const handleSave = async () => {
    if (!order || !editStatus || editStatus === order.status) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateOrder(order.id, { status: editStatus } as any);
      setOrder(updated);
      setEditStatus(updated.status);
      message.success('Order status updated');
      setIsEditing(false);
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 48 }}><Spin size="large" /></div>;
  }

  if (!order) {
    return <div style={{ textAlign: "center", padding: 48 }}>Purchase order not found.</div>;
  }

  const lineColumns = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price", dataIndex: "unitPrice", key: "unitPrice", render: (v: number) => `$${(v ?? 0).toFixed(2)}` },
    { title: "Discount", dataIndex: "discount", key: "discount", render: (v: number) => `$${(v ?? 0).toFixed(2)}` },
    { title: "Total", dataIndex: "lineTotal", key: "lineTotal", render: (v: number) => `$${(v ?? 0).toFixed(2)}` },
    { title: "Received", dataIndex: "receivedQty", key: "receivedQty" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/purchasing/orders")}>Back</Button>
        <h1 style={{ margin: 0 }}>Purchase Order {order.poNumber}</h1>
        {!isEditing ? (
          <>
            <Tag color={statusColors[order.status]}>{order.status}</Tag>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/purchasing/orders/${id}/edit`)}>Edit</Button>
          </>
        ) : (
          <>
            <Select
              style={{ width: 160 }}
              options={statusOptions}
              value={editStatus || undefined}
              onChange={(v) => setEditStatus(v as PurchaseOrderStatus)}
            />
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Save</Button>
          </>
        )}
      </div>

      <Card title="Order Information" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="PO Number">{order.poNumber}</Descriptions.Item>
          <Descriptions.Item label="Supplier">{order.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Order Date">{new Date(order.orderDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Expected Date">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={statusColors[order.status]}>{order.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Received Date">{order.receivedDate ? new Date(order.receivedDate).toLocaleDateString() : '-'}</Descriptions.Item>
          <Descriptions.Item label="Subtotal">${(order.subtotal ?? 0).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="Total">${(order.totalAmount ?? 0).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>{order.notes || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Line Items">
        <Table columns={lineColumns} dataSource={order.lines} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default PurchaseOrderDetailsPage;
