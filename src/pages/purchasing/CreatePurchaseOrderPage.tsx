import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Select, Input, InputNumber, Table, Space, message, AutoComplete as AntAutoComplete } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { inventoryService } from '../../services/inventoryService';
import type { Product } from '../../types/product.types';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../hooks/useSuppliers';
import styles from './CreatePurchaseOrderPage.module.css';

const schema = yup.object({
  supplierId: yup.number().required('Supplier is required'),
  orderDate: yup.string().required('Order date is required'),
  expectedDate: yup.string().default(''),
  notes: yup.string().default(''),
});

type FormData = yup.InferType<typeof schema>;

interface LineItem {
  tempId: number;
  productId: number | undefined;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPurchaseOrder } = usePurchaseOrders();
  const { suppliers, fetchSuppliers } = useSuppliers();

  const defaultSupplierId = searchParams.get('supplier') ? Number(searchParams.get('supplier')) : undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      supplierId: defaultSupplierId,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
      notes: '',
    },
  });

  const selectedSupplierId = watch("supplierId");
  const selectedSupplier = suppliers.find(
    (s) => s.id === Number(selectedSupplierId),
  );

  useEffect(() => {
    fetchSuppliers({}, 1);
  }, [fetchSuppliers]);

  const searchProducts = async (query: string) => {
    try {
      const result = await inventoryService.getProducts({ search: query });
      setProductSearchResults(result.data);
    } catch {
      setProductSearchResults([]);
    }
  };

  useEffect(() => {
    searchProducts('');
  }, []);

  const addItem = () => {
    let nextId = 1;
    if (items.length > 0) {
      nextId = Math.max(...items.map(i => i.tempId)) + 1;
    }
    setItems([
      ...items,
      {
        tempId: nextId,
        productId: undefined,
        productName: '',
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0,
      },
    ]);
  };

  const handleProductSelect = (index: number, productId: number | null, product?: Product) => {
    const updatedItems = [...items];
    if (productId && product) {
      updatedItems[index] = {
        ...updatedItems[index],
        productId,
        productName: product.name,
        quantity: updatedItems[index].quantity,
        unitPrice: product.unitPrice,
        lineTotal: product.unitPrice * updatedItems[index].quantity,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        productId: undefined,
        productName: '',
        unitPrice: 0,
        lineTotal: 0,
      };
    }
    setItems(updatedItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].lineTotal = updatedItems[index].unitPrice * quantity;
    setItems(updatedItems);
  };

  const updateUnitPrice = (index: number, unitPrice: number) => {
    const updatedItems = [...items];
    updatedItems[index].unitPrice = unitPrice;
    updatedItems[index].lineTotal = unitPrice * updatedItems[index].quantity;
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
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

    const hasInvalid = items.some(i => !i.productId);
    if (hasInvalid) {
      message.error('Please select a product for all line items');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPurchaseOrder({
        supplierId: data.supplierId,
        orderDate: new Date(data.orderDate).toISOString(),
        expectedDate: data.expectedDate || new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        items: items.map(i => ({
          productId: i.productId!,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      message.success('Purchase order created successfully');
      navigate('/purchasing/orders');
    } catch {
      message.error("Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  const productOptions = productSearchResults.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_: unknown, record: LineItem, index: number) => (
        <AntAutoComplete
          style={{ width: '100%' }}
          placeholder="Search product..."
          value={record.productId ?? undefined}
          options={productOptions}
          onSelect={(value) => {
            const product = productSearchResults.find(p => p.id === value);
            handleProductSelect(index, value as number, product);
          }}
          onSearch={searchProducts}
          onFocus={() => searchProducts('')}
          allowClear
          filterOption={false}
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
          value={record.quantity}
          onChange={(value) => updateQuantity(index, value || 1)}
          style={{ width: '100%' }}
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
          value={record.unitPrice}
          onChange={(value) => updateUnitPrice(index, value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 120,
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, _record: LineItem, index: number) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(index)} />
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Purchase Order</h1>
        <Space className={styles.actions}>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Submit Order
          </Button>
          <Button onClick={() => navigate("/purchasing/orders")}>Cancel</Button>
        </Space>
      </div>

      <div className={styles.formGrid}>
        <div>
          <Card title="Supplier Information" className={styles.formCard}>
            <div className={styles.formSection}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Select Supplier *
              </label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Choose a supplier..."
                    style={{ width: '100%' }}
                    options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                    status={errors.supplierId ? 'error' : undefined}
                    onFocus={() => fetchSuppliers({}, 1)}
                  />
                )}
              />
              {errors.supplierId && (
                <span style={{ color: "#ff4d4f", fontSize: 12 }}>
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
              rowKey="tempId"
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
              <div className={styles.formSection}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Order Date
                </label>
                <Controller
                  name="orderDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </div>

              <div className={styles.formSection}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Expected Delivery Date
                </label>
                <Controller
                  name="expectedDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </div>

              <div className={styles.formSection}>
                <label style={{ display: 'block', marginBottom: 8 }}>Notes</label>
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
