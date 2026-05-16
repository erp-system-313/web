import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Card,
  Select,
  Input,
  InputNumber,
  Table,
  Space,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";
import { useSuppliers } from "../../hooks/useSuppliers";
import { useProducts } from "../../hooks/useProducts";
import formStyles from "../../components/common/FormCard/FormCard.module.css";
import styles from "./CreatePurchaseOrderPage.module.css";

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const schema = yup.object({
  supplierId: yup.string().required("Supplier is required"),
  orderDate: yup.string().required("Order date is required"),
  expectedDate: yup.string().default(""),
  notes: yup.string().default(""),
});

type FormData = yup.InferType<typeof schema>;

const today = new Date().toISOString().split("T")[0];

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPurchaseOrder } = usePurchaseOrders();
  const { suppliers, fetchSuppliers } = useSuppliers();
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  const defaultSupplierId = searchParams.get("supplier") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      supplierId: defaultSupplierId,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: "",
      notes: "",
    },
  });

  const selectedSupplierId = watch("supplierId");
  const selectedSupplier = suppliers.find(
    (s) => s.id === Number(selectedSupplierId),
  );

  useEffect(() => {
    fetchSuppliers({}, 1);
    fetchProducts({}, 1);
  }, [fetchSuppliers, fetchProducts]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: "",
        productName: "",
        productSku: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const updateItem = (
    index: number,
    productId: string,
    quantity: number,
    unitPrice: number,
  ) => {
    const updatedItems = [...items];
    const product = products.find((p) => p.id === productId);
    updatedItems[index] = {
      ...updatedItems[index],
      productId,
      productName: product?.name || "",
      productSku: product?.sku || "",
      quantity,
      unitPrice: unitPrice || product?.unitPrice || 0,
      totalPrice: (unitPrice || product?.unitPrice || 0) * quantity,
    };
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.1;
    const shippingCost = 50;
    const totalAmount = subtotal + taxAmount + shippingCost;
    return { subtotal, taxAmount, shippingCost, totalAmount };
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPurchaseOrder({
        supplierId: Number(data.supplierId),
        orderDate: `${data.orderDate}T00:00:00`,
        expectedDate: data.expectedDate || undefined,
        notes: data.notes || "",
        lines: items.map((item) => ({
          productId: Number(item.productId) || 0,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          notes: "",
        })),
      });
      navigate("/purchasing/orders");
    } catch {
      message.error("Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  const itemColumns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      render: (_: unknown, record: LineItem, index: number) => (
        <Select
          placeholder="Select product"
          style={{ width: "100%" }}
          loading={productsLoading}
          showSearch
          optionFilterProp="label"
          options={products.map((p) => ({
            value: String(p.id),
            label: `${p.name} (${p.sku})`,
          }))}
          value={record.productId || undefined}
          onChange={(value) =>
            updateItem(
              index,
              value,
              items[index]?.quantity || 1,
              items[index]?.unitPrice || 0,
            )
          }
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (_: unknown, record: LineItem, index: number) => (
        <InputNumber
          min={1}
          value={record.quantity || 1}
          onChange={(value) =>
            updateItem(
              index,
              items[index]?.productId,
              value || 1,
              items[index]?.unitPrice || 0,
            )
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      render: (_: unknown, record: LineItem, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          prefix="$"
          value={record.unitPrice || 0}
          onChange={(value) =>
            updateItem(
              index,
              items[index]?.productId,
              items[index]?.quantity || 1,
              value || 0,
            )
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, _record: LineItem, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/purchasing/orders")}
        >
          Back
        </Button>
        <h1 className={styles.title}>Create Purchase Order</h1>
      </div>

      <div className={styles.formGrid}>
        <div>
          <Card title="Supplier Information" className={styles.formCard}>
            <div className={formStyles.formItem}>
              <label>Select Supplier *</label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Choose a supplier..."
                    style={{ width: "100%" }}
                    options={suppliers.map((s) => ({
                      value: String(s.id),
                      label: `${s.name} (${s.code})`,
                    }))}
                    status={errors.supplierId ? "error" : undefined}
                  />
                )}
              />
              {errors.supplierId && (
                <span className={formStyles.error}>
                  {errors.supplierId.message}
                </span>
              )}
            </div>

            {selectedSupplier && (
              <div className={styles.supplierInfo}>
                <p>
                  <strong>Contact:</strong> {selectedSupplier.contactPerson}
                </p>
                <p>
                  <strong>Email:</strong> {selectedSupplier.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedSupplier.phone}
                </p>
                <p>
                  <strong>Payment Terms:</strong>{" "}
                  {selectedSupplier.paymentTerms}
                </p>
              </div>
            )}
          </Card>

          <Card
            title="Order Lines"
            className={styles.formCard}
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
                Add Product
              </Button>
            }
          >
            <Table
              columns={itemColumns}
              dataSource={items}
              rowKey="id"
              pagination={false}
              className={styles.itemsTable}
              locale={{
                emptyText:
                  'No products added yet. Click "Add Product" to start.',
              }}
            />
          </Card>
        </div>

        <div>
          <div className={styles.orderSummary}>
            <Card title="Order Details" className={styles.formCard}>
              <div className={formStyles.formItem}>
                <label>Order Date</label>
                <Controller
                  name="orderDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" min={today} {...field} />
                  )}
                />
              </div>

              <div className={formStyles.formItem}>
                <label>Expected Delivery Date</label>
                <Controller
                  name="expectedDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" min={today} {...field} />
                  )}
                />
              </div>

              <div className={formStyles.formItem}>
                <label>Notes</label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      rows={3}
                      placeholder="Special instructions..."
                    />
                  )}
                />
              </div>
            </Card>

            <div className={formStyles.actions}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting}
              >
                Submit Order
              </Button>
              <Button onClick={() => navigate("/purchasing/orders")}>
                Cancel
              </Button>
            </div>

            <Card title="Order Summary">
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (10%):</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>${totals.shippingCost.toFixed(2)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  margin: "12px 0",
                  paddingTop: 12,
                }}
              >
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>${totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPage;
