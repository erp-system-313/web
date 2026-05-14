import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Space, message, Divider, Row, Col, Select } from "antd";
import {
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { StatusBadge, Autocomplete } from "../../../components/common";
import { useSalesOrder } from "../../../hooks";
import { salesService } from "../../../services/salesService";
import { inventoryService } from "../../../services/inventoryService";
import type { Product } from "../../../types/product.types";
import type { SalesOrder } from "../../../types/sales";
import styles from "./SalesOrderForm.module.css";

interface FormValues {
  customerId?: number;
  orderDate?: string;
  notes?: string;
  lines: {
    productId?: number;
    productName?: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

const schema = yup.object({
  customerId: yup.number().required("Customer is required"),
  orderDate: yup.string().required("Order date is required"),
  notes: yup.string().optional(),
  lines: yup
    .array()
    .of(
      yup.object({
        productId: yup.number().required("Product is required"),
        productName: yup.string(),
        productSku: yup.string(),
        quantity: yup.number().min(1).required(),
        unitPrice: yup.number().min(0).required(),
        lineTotal: yup.number(),
      }),
    )
    .required(),
});

export const SalesOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const orderId = isEditMode ? parseInt(id || "0", 10) : undefined;

  const {
    data: existingOrder,
    loading,
    saving,
    create,
    update,
  } = useSalesOrder(orderId);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      lines: [
        { productId: undefined, quantity: 1, unitPrice: 0, lineTotal: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");

  React.useEffect(() => {
    if (existingOrder) {
      reset({
        customerId: existingOrder.customerId,
        orderDate: existingOrder.orderDate,
        notes: existingOrder.notes || "",
        lines:
          existingOrder.lines?.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            productSku: line.productSku,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          })) || [],
      });
    }
  }, [existingOrder, reset]);

  const toISO = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString();
    return new Date(dateStr).toISOString();
  };

  const buildOrderData = (data: FormValues) => ({
    customerId: data.customerId!,
    orderDate: toISO(data.orderDate!),
    notes: data.notes,
    lines: data.lines
      .filter((line) => line.productId)
      .map((line) => ({
        productId: line.productId!,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const orderData = buildOrderData(data);
      let result: SalesOrder | null = null;

      if (isEditMode) {
        result = await update(orderData);
      } else {
        result = await create(orderData);
      }

      if (!result) {
        message.error("Failed to save order");
        return;
      }
      message.success(isEditMode ? "Order saved successfully" : "Order created successfully");
      navigate("/sales/orders");
    } catch {
      message.error("Failed to save order");
    }
  };

  const onSubmitForApproval = handleSubmit(async (data) => {
    try {
      const orderData = buildOrderData(data);
      let order: SalesOrder | null = null;

      if (isEditMode) {
        order = await update(orderData);
      } else {
        order = await create(orderData);
      }

      if (!order) {
        message.error("Failed to submit order");
        return;
      }

      await salesService.salesOrders.confirm(order.id);
      message.success("Order submitted successfully");
      navigate("/sales/orders");
    } catch {
      message.error("Failed to submit order");
    }
  });

  const handleProductChange = (
    index: number,
    productId: number | null,
    product?: { name?: string; sku?: string; costPrice?: number },
  ) => {
    if (productId && product) {
      setValue(`lines.${index}.productId`, productId, { shouldValidate: true });
      setValue(`lines.${index}.productName`, product.name, {
        shouldDirty: true,
      });
      setValue(`lines.${index}.productSku`, product.sku, { shouldDirty: true });
      setValue(`lines.${index}.unitPrice`, product.costPrice || 0, {
        shouldDirty: true,
      });
      setValue(
        `lines.${index}.lineTotal`,
        (product.costPrice || 0) * watchedLines[index].quantity,
        { shouldDirty: true },
      );
    } else {
      setValue(`lines.${index}.productId`, undefined, { shouldValidate: true });
      setValue(`lines.${index}.productName`, undefined);
      setValue(`lines.${index}.productSku`, undefined);
      setValue(`lines.${index}.unitPrice`, 0);
      setValue(`lines.${index}.lineTotal`, 0);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setValue(`lines.${index}.quantity`, quantity, { shouldDirty: true });
    const unitPrice = watchedLines[index].unitPrice || 0;
    setValue(`lines.${index}.lineTotal`, unitPrice * quantity, {
      shouldDirty: true,
    });
  };

  const totals = watchedLines.reduce(
    (acc, line) => {
      acc.subtotal += line.lineTotal || 0;
      return acc;
    },
    { subtotal: 0 },
  );
  const tax = totals.subtotal * 0.1;
  const total = totals.subtotal + tax;

  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(false);

  const loadProducts = React.useCallback(async () => {
    setProductsLoading(true);
    try {
      const result = await inventoryService.getProducts({}, 1, 200);
      setProducts(result.data);
    } catch {
      message.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="Order Details" className={styles.card}>
          <Row gutter={16}>
            <Col span={8}>
              <div className={styles.formItem}>
                <label>Customer *</label>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      placeholder="Search customer..."
                      value={field.value}
                      onChange={(newId) => {
                        field.onChange(newId);
                      }}
                      fetchOptions={async (query) => {
                        return salesService.customers.search(query);
                      }}
                      displayFormatter={(item) => `${item.name}`}
                    />
                  )}
                />
                {errors.customerId && (
                  <span className={styles.error}>
                    {errors.customerId.message}
                  </span>
                )}
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.formItem}>
                <label>Order Date *</label>
                <input
                  type="date"
                  {...register("orderDate")}
                  className={styles.dateInput}
                />
                {errors.orderDate && (
                  <span className={styles.error}>
                    {errors.orderDate.message}
                  </span>
                )}
              </div>
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
              {fields.map((field, index) => (
                <tr key={field.id}>
                    <td>
                      <Controller
                        name={`lines.${index}.productId`}
                        control={control}
                        render={() => (
                          <Select
                            placeholder="Select a product..."
                            style={{ width: '100%' }}
                            loading={productsLoading}
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={products.map(p => ({
                              value: p.id,
                              label: `${p.name} (${p.sku})`,
                            }))}
                            value={watchedLines[index]?.productId || undefined}
                            onChange={(value) => {
                              const product = products.find(p => p.id === value);
                              handleProductChange(
                                index,
                                value as number | null,
                                product
                                  ? { name: product.name, sku: product.sku, costPrice: product.costPrice }
                                  : undefined,
                              );
                            }}
                            onFocus={loadProducts}
                            notFoundContent={productsLoading ? "Loading..." : "No products found"}
                            allowClear
                          />
                        )}
                      />
                    </td>
                  <td>{watchedLines[index]?.productSku || "-"}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      {...register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                        onChange: (e) =>
                          handleQuantityChange(
                            index,
                            parseInt(e.target.value) || 1,
                          ),
                      })}
                      className={styles.numberInput}
                    />
                  </td>
                  <td>${(watchedLines[index]?.unitPrice || 0).toFixed(2)}</td>
                  <td>${(watchedLines[index]?.lineTotal || 0).toFixed(2)}</td>
                  <td>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() =>
              append({
                productId: undefined,
                quantity: 1,
                unitPrice: 0,
                lineTotal: 0,
              })
            }
            className={styles.addLineBtn}
          >
            Add Line Item
          </Button>

          <Divider />

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${(totals.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax (10%):</span>
              <span>${(tax ?? 0).toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total:</span>
              <span>${(total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card title="Additional Information" className={styles.card}>
          <Row gutter={16}>
            <Col span={24}>
              <div className={styles.formItem}>
                <label>Notes</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Add notes for this order..."
                  className={styles.textarea}
                />
              </div>
            </Col>

          </Row>
        </Card>

        <div className={styles.actions}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={saving}
            >
              Save Draft
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSubmitForApproval}
              loading={saving}
            >
              Submit Order
            </Button>
          </Space>
        </div>
      </form>
    </div>
  );
};

export default SalesOrderForm;
