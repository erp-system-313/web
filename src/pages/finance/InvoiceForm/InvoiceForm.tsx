import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Table,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { StatusBadge } from "../../../components/common";
import { useInvoice } from "../../../hooks";
import styles from "./InvoiceForm.module.css";

interface LineItem {
  id: string;
  productId?: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const invoiceId = isEditMode ? parseInt(id || "0", 10) : undefined;

  const {
    data: existingInvoice,
    loading,
    saving,
    create,
    update,
  } = useInvoice(invoiceId);
  const [form] = Form.useForm();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [lines, setLines] = useState<LineItem[]>([
    { id: "1", quantity: 1, unitPrice: 0, lineTotal: 0 },
  ]);

  const handleSubmit = async (status: string) => {
    try {
      const values = await form.validateFields();
      void lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

      const invoiceData = {
        customerId: customerId!,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        status: status as "DRAFT" | "SENT" | "PAID" | "CANCELLED",
        lines: lines
          .filter((l) => l.productId)
          .map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: 0.1,
          })),
      };

      if (isEditMode) {
        await update(invoiceData);
        message.success("Invoice updated");
      } else {
        await create(invoiceData);
        message.success("Invoice created");
      }
      navigate("/finance/invoices");
    } catch {
      message.error("Please fill in all required fields");
    }
  };

  if (isEditMode && loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/finance/invoices")}
        >
          Back
        </Button>
        <h1>{isEditMode ? "Edit Invoice" : "New Invoice"}</h1>
        {existingInvoice && <StatusBadge status={existingInvoice.status} />}
      </div>

      <Form form={form} layout="vertical">
        <Card title="Invoice Details" className={styles.card}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Customer" rules={[{ required: true }]}>
                <Select
                  placeholder="Select customer..."
                  value={customerId}
                  onChange={(newId: number) => setCustomerId(newId)}
                  options={[
                    { value: 1, label: "Acme Corp" },
                    { value: 2, label: "Tech Solutions" },
                    { value: 3, label: "Global Industries" },
                  ]}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="invoiceDate"
                label="Invoice Date"
                rules={[{ required: true }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Line Items" className={styles.card}>
          <Table
            dataSource={lines}
            rowKey="id"
            pagination={false}
            columns={[
              { title: "Product", dataIndex: "productId", key: "productId" },
              {
                title: "Qty",
                dataIndex: "quantity",
                key: "quantity",
                width: 100,
              },
              {
                title: "Unit Price",
                dataIndex: "unitPrice",
                key: "unitPrice",
                width: 120,
              },
              {
                title: "Total",
                key: "total",
                width: 120,
                render: (_: unknown, record: LineItem) =>
                  `$${(record.unitPrice * record.quantity).toFixed(2)}`,
              },
              {
                title: "",
                key: "action",
                width: 50,
                render: (_: unknown, record: LineItem) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setLines(lines.filter((l) => l.id !== record.id))
                    }
                    disabled={lines.length === 1}
                  />
                ),
              },
            ]}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() =>
              setLines([
                ...lines,
                {
                  id: String(Date.now()),
                  quantity: 1,
                  unitPrice: 0,
                  lineTotal: 0,
                },
              ])
            }
            className={styles.addBtn}
          >
            Add Line
          </Button>
        </Card>

        <div className={styles.actions}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSubmit("DRAFT")}
              loading={saving}
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit("SENT")}
              loading={saving}
            >
              Create & Send
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default InvoiceForm;
