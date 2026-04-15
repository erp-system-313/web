import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Descriptions,
  Table,
  Typography,
  Timeline,
  Row,
  Col,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { StatusBadge } from "../../../components/common";
import { useSalesOrder } from "../../../hooks";
import styles from "./SalesOrderDetails.module.css";

const { Title } = Typography;

interface TimelineEvent {
  status: string;
  date: string;
  description: string;
}

export const SalesOrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  const { data: order, loading, error } = useSalesOrder(orderId);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error || !order) {
    return <div className={styles.container}>Order not found</div>;
  }

  const generateTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    events.push({
      status: "Created",
      date: new Date(order.createdAt).toLocaleString(),
      description: `Order ${order.orderNumber} was created`,
    });
    if (order.status !== "DRAFT") {
      events.push({
        status: "Submitted",
        date: new Date(order.updatedAt).toLocaleString(),
        description: `Order was submitted for processing`,
      });
    }
    if (order.status === "SHIPPED" || order.status === "INVOICED") {
      events.push({
        status: "Shipped",
        date: new Date(order.updatedAt).toLocaleString(),
        description: `Order was shipped`,
      });
    }
    if (order.status === "INVOICED") {
      events.push({
        status: "Invoiced",
        date: new Date(order.updatedAt).toLocaleString(),
        description: `Invoice was generated`,
      });
    }
    if (order.status === "CANCELLED") {
      events.push({
        status: "Cancelled",
        date: new Date(order.updatedAt).toLocaleString(),
        description: `Order was cancelled`,
      });
    }
    return events.reverse();
  };

  const lineItemColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "SKU",
      dataIndex: "productSku",
      key: "productSku",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right" as const,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Line Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right" as const,
      render: (total: number) => `$${total.toFixed(2)}`,
    },
  ];

  const handleCreateInvoice = () => {
    message.info(
      "Invoice creation will be available when Finance module is built",
    );
    navigate("/finance/invoices/new");
  };

  const handlePrint = () => {
    message.info("Print/PDF will be available when Finance module is built");
  };

  const timeline = generateTimeline();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sales/orders")}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0, flex: 1 }}>
          {order.orderNumber}
        </Title>
        <StatusBadge status={order.status} />
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Order Information" className={styles.card}>
            <Descriptions column={2}>
              <Descriptions.Item label="Customer">
                {order.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(order.orderDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Required Date">
                {order.requiredDate
                  ? new Date(order.requiredDate).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Terms">
                {order.paymentTerms || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Line Items" className={styles.card}>
            <Table
              dataSource={order.lines || []}
              columns={lineItemColumns}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Subtotal</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>${order.subtotal.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      Tax (10%)
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      ${order.taxAmount.toFixed(2)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>${order.totalAmount.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          {(order.notes || order.shippingAddress) && (
            <Card title="Additional Information" className={styles.card}>
              {order.notes && (
                <Descriptions column={1}>
                  <Descriptions.Item label="Notes">
                    {order.notes}
                  </Descriptions.Item>
                </Descriptions>
              )}
              {order.shippingAddress && (
                <Descriptions column={1}>
                  <Descriptions.Item label="Shipping Address">
                    {order.shippingAddress}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Card>
          )}
        </Col>

        <Col span={8}>
          <Card title="Activity" className={styles.card}>
            <Timeline
              items={timeline.map((event) => ({
                color: event.status === "Cancelled" ? "red" : "blue",
                children: (
                  <div>
                    <strong>{event.status}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {event.date}
                    </span>
                    <br />
                    <span style={{ fontSize: 13 }}>{event.description}</span>
                  </div>
                ),
              }))}
            />
          </Card>

          <Card className={styles.card}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/sales/orders/${order.id}/edit`)}
                block
              >
                Edit Order
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={handleCreateInvoice}
                block
              >
                Create Invoice
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint} block>
                Print / PDF
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesOrderDetails;
