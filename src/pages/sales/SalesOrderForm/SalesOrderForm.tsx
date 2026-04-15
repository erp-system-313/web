import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
} from "antd";
import {
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  StatusBadge,
  Autocomplete,
  TabPanel,
} from "../../../components/common";
import { useSalesOrder, useCustomers, useProducts } from "../../../hooks";
import { mockProducts } from "../../../mocks/productsMockData";
import type { CreateSalesOrderDto } from "../../../types/sales";
import styles from "./SalesOrderForm.module.css";

const { TextArea } = Input;

interface LineItem {
  id: string;
  productId?: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const SalesOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const orderId = isEditMode ? parseInt(id || "0", 10) : undefined;

  const [form] = Form.useForm();
  const {
    data: existingOrder,
    loading,
    saving,
    create,
    update,
  } = useSalesOrder(orderId);
  const { searchProducts } = useProducts();

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", quantity: 1, unitPrice: 0, lineTotal: 0 },
  ]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existingOrder) {
      form.setFieldsValue({
        customerId: existingOrder.customerId,
        orderDate: dayjs(existingOrder.orderDate),
        requiredDate: existingOrder.requiredDate
          ? dayjs(existingOrder.requiredDate)
          : undefined,
      });
      setCustomerId(existingOrder.customerId);
      setNotes(existingOrder.notes || "");
      if (existingOrder.lines) {
        setLineItems(
          existingOrder.lines.map((line) => ({
            id: String(line.id),
            productId: line.productId,
            productName: line.productName,
            productSku: line.productSku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          })),
        );
      }
    }
  }, [existingOrder, form]);

  const handleCustomerChange = (newCustomerId: number | null) => {
    setCustomerId(newCustomerId);
    if (newCustomerId) {
      form.setFieldValue("customerId", newCustomerId);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateSalesOrderDto = {
        customerId: customerId!,
        orderDate: values.orderDate.format("YYYY-MM-DD"),
        requiredDate: values.requiredDate?.format("YYYY-MM-DD"),
        status: "DRAFT",
        notes,
        lines: lineItems
          .filter((item) => item.productId)
          .map((item) => ({
            productId: item.productId!,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
      };

      if (isEditMode) {
        await update(dto);
        message.success("Order saved successfully");
      } else {
        await create(dto);
        message.success("Order created successfully");
      }
      navigate("/sales/orders");
    } catch {
      message.error("Please fill in all required fields");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateSalesOrderDto = {
        customerId: customerId!,
        orderDate: values.orderDate.format("YYYY-MM-DD"),
        requiredDate: values.requiredDate?.format("YYYY-MM-DD"),
        status: "CONFIRMED",
        notes,
        lines: lineItems
          .filter((item) => item.productId)
          .map((item) => ({
            productId: item.productId!,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
      };

      if (isEditMode) {
        await update(dto);
        message.success("Order submitted successfully");
      } else {
        await create(dto);
        message.success("Order created and submitted");
      }
      navigate("/sales/orders");
    } catch {
      message.error("Please fill in all required fields");
    }
  };

  const fetchCustomerOptions = async (query: string) => {
    const { data } = useCustomers({ search: query });
    return data;
  };

  const fetchProductOptions = async (query: string) => {
    return searchProducts(query);
  };

  const tabItems = [
    {
      label: "Notes",
      key: "notes",
      children: (
        <TextArea
          rows={4}
          placeholder="Add notes for this order..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      ),
    },
    {
      label: "Shipping",
      key: "shipping",
      children: (
        <Form.Item label="Shipping Address">
          <Input.TextArea rows={3} placeholder="Enter shipping address" />
        </Form.Item>
      ),
    },
    {
      label: "Payment",
      key: "payment",
      children: (
        <Form.Item label="Payment Terms">
          <Input placeholder="e.g., NET 30" />
        </Form.Item>
      ),
    },
  ];

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [lineItems]);

  if (isEditMode && loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sales/orders")}
        >
          Back
        </Button>
        <h1>{isEditMode ? "Edit Order" : "New Sales Order"}</h1>
        {existingOrder && <StatusBadge status={existingOrder.status} />}
      </div>

      <Form form={form} layout="vertical" className={styles.form}>
        <Card title="Order Details" className={styles.card}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="customerId"
                label="Customer"
                rules={[{ required: true, message: "Customer is required" }]}
              >
                <Autocomplete
                  placeholder="Search customer..."
                  value={customerId}
                  onChange={handleCustomerChange}
                  fetchOptions={fetchCustomerOptions}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="orderDate"
                label="Order Date"
                rules={[{ required: true, message: "Order date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requiredDate" label="Required Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Line Items" className={styles.card}>
          <table className={styles.lineItemsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <Autocomplete
                      placeholder="Search product..."
                      value={item.productId}
                      onChange={(newId) => {
                        const updated = [...lineItems];
                        if (newId) {
                          const prod = mockProducts.find((p) => p.id === newId);
                          if (prod) {
                            updated[index] = {
                              ...updated[index],
                              productId: prod.id,
                              productName: prod.name,
                              productSku: prod.sku,
                              unitPrice: prod.unitPrice,
                              lineTotal:
                                prod.unitPrice * updated[index].quantity,
                            };
                          }
                        } else {
                          updated[index] = {
                            ...updated[index],
                            productId: undefined,
                            productName: undefined,
                            productSku: undefined,
                            unitPrice: 0,
                            lineTotal: 0,
                          };
                        }
                        setLineItems(updated);
                      }}
                      fetchOptions={fetchProductOptions}
                      displayFormatter={(p) => `${p.name} (${p.sku})`}
                    />
                  </td>
                  <td>{item.productSku || "-"}</td>
                  <td>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        const updated = [...lineItems];
                        updated[index] = {
                          ...updated[index],
                          quantity: qty,
                          lineTotal: qty * updated[index].unitPrice,
                        };
                        setLineItems(updated);
                      }}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td>${item.lineTotal.toFixed(2)}</td>
                  <td>
                    <Button
                      type="text"
                      danger
                      onClick={() =>
                        setLineItems(lineItems.filter((_, i) => i !== index))
                      }
                      disabled={lineItems.length === 1}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            type="dashed"
            onClick={() =>
              setLineItems([
                ...lineItems,
                {
                  id: String(Date.now()),
                  quantity: 1,
                  unitPrice: 0,
                  lineTotal: 0,
                },
              ])
            }
            className={styles.addLineBtn}
          >
            Add Line Item
          </Button>

          <Divider />

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax (10%):</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card title="Additional Information" className={styles.card}>
          <TabPanel items={tabItems} />
        </Card>

        <div className={styles.actions}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              loading={saving}
            >
              Save Draft
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={saving}
            >
              Submit Order
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default SalesOrderForm;
