import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Select, Input, InputNumber, Table, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CreatePurchaseOrderDto, PurchaseOrderItem } from '../../types/purchaseOrder.types';
import type { Supplier } from '../../types/supplier.types';
import styles from './CreatePurchaseOrderPage.module.css';

const schema = yup.object({
  supplierId: yup.string().required('Supplier is required'),
  orderDate: yup.string().required('Order date is required'),
  deliveryDate: yup.string().default(''),
  paymentTerms: yup.string().required('Payment terms is required'),
  notes: yup.string().default(''),
});

type FormData = yup.InferType<typeof schema>;

interface UsePurchaseOrdersReturn {
  createPurchaseOrder: (data: CreatePurchaseOrderDto) => Promise<void>;
}

const usePurchaseOrders = (): UsePurchaseOrdersReturn => {
  const createPurchaseOrder = async (_data: CreatePurchaseOrderDto) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success('Purchase order created successfully');
  };
  return { createPurchaseOrder };
};

interface UseSuppliersReturn {
  suppliers: Supplier[];
  fetchSuppliers: () => Promise<void>;
}

const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'TechSupply Co.',
      contactPerson: 'John Smith',
      email: 'john@techsupply.com',
      phone: '+1 555-0101',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
      paymentTerms: 'Net 30',
      rating: 5,
      totalOrders: 45,
      onTimeDelivery: 98,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Global Parts Ltd.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@globalparts.com',
      phone: '+1 555-0102',
      address: '456 Industrial Ave',
      city: 'New York',
      country: 'USA',
      paymentTerms: 'Net 60',
      rating: 4,
      totalOrders: 32,
      onTimeDelivery: 92,
      isActive: true,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: '3',
      name: 'Quality Electronics',
      contactPerson: 'Mike Chen',
      email: 'mike@qualityelec.com',
      phone: '+1 555-0103',
      address: '789 Circuit Road',
      city: 'Los Angeles',
      country: 'USA',
      paymentTerms: 'Net 30',
      rating: 5,
      totalOrders: 67,
      onTimeDelivery: 95,
      isActive: true,
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
    },
  ];

  const fetchSuppliers = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setSuppliers(mockSuppliers);
  };

  return { suppliers, fetchSuppliers };
};

const paymentTermsOptions = [
  { value: 'Net 30', label: 'Net 30' },
  { value: 'Net 60', label: 'Net 60' },
  { value: 'Net 90', label: 'Net 90' },
  { value: 'COD', label: 'COD' },
  { value: 'Prepaid', label: 'Prepaid' },
];

const mockProducts = [
  { value: 'prod1', label: 'Product A (SKU: A001)' },
  { value: 'prod2', label: 'Product B (SKU: B002)' },
  { value: 'prod3', label: 'Product C (SKU: C003)' },
];

export const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPurchaseOrder } = usePurchaseOrders();
  const { suppliers, fetchSuppliers } = useSuppliers();
  
  const defaultSupplierId = searchParams.get('supplier') || '';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      supplierId: defaultSupplierId,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      paymentTerms: 'Net 30',
      notes: '',
    },
  });

  const selectedSupplierId = watch('supplierId');
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: '',
        productName: '',
        productSku: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const updateItem = (index: number, productId: string, quantity: number, unitPrice: number) => {
    const updatedItems = [...items];
    const product = mockProducts.find(p => p.value === productId);
    updatedItems[index] = {
      ...updatedItems[index],
      productId,
      productName: product?.label.split(' (')[0] || '',
      productSku: product?.label.match(/\(SKU: (.+)\)/)?.[1] || '',
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
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

  const onSubmit = async (data: FormData, status: 'draft' | 'submitted') => {
    if (items.length === 0) {
      message.error('Please add at least one product');
      return;
    }

    const totals = calculateTotals();
    setIsSubmitting(true);
    
    try {
      await createPurchaseOrder({
        supplierId: data.supplierId,
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate || new Date().toISOString().split('T')[0],
        paymentTerms: data.paymentTerms,
        notes: data.notes || '',
        status,
        items,
        ...totals,
      });
      navigate('/purchasing/orders');
    } catch {
      message.error('Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'productId',
      render: (_: unknown, record: PurchaseOrderItem, index: number) => (
        <Select
          placeholder="Select product"
          style={{ width: '100%' }}
          options={mockProducts}
          value={record.productId || undefined}
          onChange={(value) => updateItem(index, value, items[index]?.quantity || 1, items[index]?.unitPrice || 0)}
        />
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: unknown, record: PurchaseOrderItem, index: number) => (
        <InputNumber
          min={1}
          value={record.quantity || 1}
          onChange={(value) => updateItem(index, items[index]?.productId, value || 1, items[index]?.unitPrice || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (_: unknown, record: PurchaseOrderItem, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          prefix="$"
          value={record.unitPrice || 0}
          onChange={(value) => updateItem(index, items[index]?.productId, items[index]?.quantity || 1, value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, _record: PurchaseOrderItem, index: number) => (
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
            onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
            loading={isSubmitting}
          >
            Save Draft
          </Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSubmit((data) => onSubmit(data, 'submitted'))}
            loading={isSubmitting}
          >
            Submit Order
          </Button>
          <Button onClick={() => navigate('/purchasing/orders')}>
            Cancel
          </Button>
        </Space>
      </div>

      <div className={styles.formGrid}>
        <div>
          <Card title="Supplier Information" className={styles.formCard}>
            <div className={styles.formSection}>
              <label style={{ display: 'block', marginBottom: 8 }}>Select Supplier *</label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Choose a supplier..."
                    style={{ width: '100%' }}
                    options={suppliers.map(s => ({ value: s.id, label: `${s.name} - ${s.city}` }))}
                    status={errors.supplierId ? 'error' : undefined}
                  />
                )}
              />
              {errors.supplierId && (
                <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errors.supplierId.message}</span>
              )}
            </div>

            {selectedSupplier && (
              <div className={styles.supplierInfo}>
                <p><strong>Contact:</strong> {selectedSupplier.contactPerson}</p>
                <p><strong>Email:</strong> {selectedSupplier.email}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
                <p><strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}</p>
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
              locale={{ emptyText: 'No products added yet. Click "Add Product" to start.' }}
            />
          </Card>
        </div>

        <div>
          <div className={styles.orderSummary}>
            <Card title="Order Details" className={styles.formCard}>
              <div className={styles.formSection}>
                <label style={{ display: 'block', marginBottom: 8 }}>Order Date</label>
                <Controller
                  name="orderDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} />
                  )}
                />
              </div>

              <div className={styles.formSection}>
                <label style={{ display: 'block', marginBottom: 8 }}>Expected Delivery Date</label>
                <Controller
                  name="deliveryDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} />
                  )}
                />
              </div>

              <div className={styles.formSection}>
                <label style={{ display: 'block', marginBottom: 8 }}>Payment Terms</label>
                <Controller
                  name="paymentTerms"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: '100%' }}
                      options={paymentTermsOptions}
                    />
                  )}
                />
              </div>

              <div className={styles.formSection}>
                <label style={{ display: 'block', marginBottom: 8 }}>Notes</label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea {...field} rows={3} placeholder="Special instructions..." />
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
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '12px 0', paddingTop: 12 }}>
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
