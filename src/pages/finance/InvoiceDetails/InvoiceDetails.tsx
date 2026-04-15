import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Table,
  Descriptions,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  SendOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { StatusBadge, TabPanel } from "../../../components/common";
import { useInvoice } from "../../../hooks";
import type {
  InvoiceLine,
  Payment,
  PaymentMethod,
} from "../../../types/finance";
import styles from "./InvoiceDetails.module.css";

const { TextArea } = Input;

export const InvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const invoiceId = parseInt(id || "0", 10);

  const {
    data: invoice,
    loading,
    saving,
    recordPayment,
  } = useInvoice(invoiceId);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm] = Form.useForm();

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!invoice) {
    return <div className={styles.container}>Invoice not found</div>;
  }

  const handleRecordPayment = async (values: {
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }) => {
    const success = await recordPayment(values);
    if (success) {
      message.success("Payment recorded successfully");
      setPaymentModalOpen(false);
      paymentForm.resetFields();
    } else {
      message.error("Failed to record payment");
    }
  };

  const lineItemColumns: ColumnsType<InvoiceLine> = [
    { title: "Product", dataIndex: "productName", key: "productName" },
    { title: "SKU", dataIndex: "productSku", key: "productSku" },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right" as const,
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: "GL Account",
      dataIndex: "glAccountName",
      key: "glAccountName",
    },
    {
      title: "Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right" as const,
      render: (v: number) => `$${v.toFixed(2)}`,
    },
  ];

  const paymentColumns: ColumnsType<Payment> = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    { title: "Method", dataIndex: "method", key: "method" },
    { title: "Reference", dataIndex: "reference", key: "reference" },
  ];

  const tabItems = [
    {
      label: "Details",
      key: "details",
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Invoice Number">
            {invoice.invoiceNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={invoice.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            {invoice.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Sales Order">
            {invoice.salesOrderId ? `SO-${invoice.salesOrderId}` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice Date">
            {new Date(invoice.invoiceDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {new Date(invoice.dueDate).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      label: "Payments",
      key: "payments",
      children: (
        <div>
          <div className={styles.sectionActions}>
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setPaymentModalOpen(true)}
              disabled={invoice.balanceDue === 0}
            >
              Record Payment
            </Button>
          </div>
          <Table
            dataSource={invoice.payments || []}
            columns={paymentColumns}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Total Paid</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>${invoice.paidAmount.toFixed(2)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/finance/invoices")}
        >
          Back
        </Button>
        <h1>{invoice.invoiceNumber}</h1>
        <StatusBadge status={invoice.status} />
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Line Items" className={styles.card}>
            <Table
              dataSource={invoice.lines || []}
              columns={lineItemColumns}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>Subtotal</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>${invoice.subtotal.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      Tax (10%)
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      ${invoice.taxAmount.toFixed(2)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>${invoice.total.toFixed(2)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>Balance Due</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong
                        style={{
                          color: invoice.balanceDue > 0 ? "#ff4d4f" : "#52c41a",
                        }}
                      >
                        ${invoice.balanceDue.toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          <Card className={styles.card}>
            <TabPanel items={tabItems} />
          </Card>
        </Col>

        <Col span={8}>
          <Card className={styles.card}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/finance/invoices/${invoice.id}/edit`)}
                block
                disabled={
                  invoice.status === "PAID" || invoice.status === "CANCELLED"
                }
              >
                Edit Invoice
              </Button>
              <Button
                icon={<SendOutlined />}
                onClick={() => message.info("Email feature coming soon")}
                block
              >
                Send Invoice
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => message.info("PDF feature coming soon")}
                block
              >
                Print / PDF
              </Button>
              <Button
                icon={<DollarOutlined />}
                onClick={() => setPaymentModalOpen(true)}
                block
                disabled={invoice.balanceDue === 0}
              >
                Record Payment
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Record Payment"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        onOk={() => paymentForm.submit()}
        confirmLoading={saving}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleRecordPayment}
          initialValues={{ amount: invoice.balanceDue }}
        >
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Amount is required" }]}
          >
            <InputNumber
              prefix="$"
              min={0.01}
              max={invoice.balanceDue}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label="Payment Date"
            rules={[{ required: true, message: "Date is required" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true, message: "Method is required" }]}
          >
            <Select
              options={[
                { value: "CASH", label: "Cash" },
                { value: "CARD", label: "Card" },
                { value: "BANK_TRANSFER", label: "Bank Transfer" },
                { value: "CHEQUE", label: "Cheque" },
              ]}
            />
          </Form.Item>
          <Form.Item name="reference" label="Reference">
            <Input placeholder="e.g., Transaction number" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} placeholder="Optional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceDetails;
