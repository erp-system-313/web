import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Tag, Button, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { PurchaseOrder, PurchaseOrderStatus } from "../../types/purchaseOrder.types";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";

const statusColors: Record<PurchaseOrderStatus, string> = {
  DRAFT: "default",
  SENT: "processing",
  RECEIVED: "green",
  PARTIAL: "blue",
  CANCELLED: "red",
  PENDING: "default",
  APPROVED: "processing",
};

export const PurchaseOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder } = usePurchaseOrders();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(Number(id)).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }, [id, getOrder]);

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
        <Tag color={statusColors[order.status]}>{order.status}</Tag>
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
