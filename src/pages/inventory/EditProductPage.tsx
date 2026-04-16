import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Input, InputNumber, Select, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Product } from '../../types/product.types';
import styles from './EditProductPage.module.css';

const basicInfoSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  description: yup.string().default(''),
  categoryId: yup.string().required('Category is required'),
});

const pricingSchema = yup.object({
  unitPrice: yup.number().required('Unit price is required').min(0, 'Price must be positive'),
  costPrice: yup.number().required('Cost price is required').min(0, 'Price must be positive'),
});

const inventorySchema = yup.object({
  stockQuantity: yup.number().required('Stock quantity is required').min(0, 'Quantity must be positive'),
  reorderPoint: yup.number().required('Reorder point is required').min(0, 'Must be positive'),
});

type BasicInfoData = yup.InferType<typeof basicInfoSchema>;
type PricingData = yup.InferType<typeof pricingSchema>;
type InventoryData = yup.InferType<typeof inventorySchema>;

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'clothing', label: 'Clothing' },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    description: 'Ergonomic wireless mouse with USB receiver',
    categoryId: 'electronics',
    categoryName: 'Electronics',
    unitPrice: 29.99,
    costPrice: 15.00,
    stockQuantity: 150,
    reorderPoint: 20,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'USB-C Cable',
    sku: 'USB-C-01',
    description: 'High-speed USB-C charging cable 6ft',
    categoryId: 'electronics',
    categoryName: 'Electronics',
    unitPrice: 12.99,
    costPrice: 5.00,
    stockQuantity: 8,
    reorderPoint: 15,
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Notebook A5',
    sku: 'NB-A5-01',
    description: 'Lined notebook with 200 pages',
    categoryId: 'office',
    categoryName: 'Office Supplies',
    unitPrice: 8.99,
    costPrice: 3.00,
    stockQuantity: 0,
    reorderPoint: 25,
    isActive: true,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
];

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerBasic, formState: { errors: errorsBasic } } = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onBlur',
  });

  const { control: pricingControl, formState: { errors: errorsPricing }, getValues: getPricingValues } = useForm<PricingData>({
    resolver: yupResolver(pricingSchema),
    mode: 'onBlur',
  });

  const { control: inventoryControl, formState: { errors: errorsInventory }, getValues: getInventoryValues } = useForm<InventoryData>({
    resolver: yupResolver(inventorySchema),
    mode: 'onBlur',
  });

  const [basicData, setBasicData] = useState<BasicInfoData | null>(null);
  const [, setPricingData] = useState<PricingData | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const found = mockProducts.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setBasicData({
          name: found.name,
          sku: found.sku,
          description: found.description,
          categoryId: found.categoryId,
        });
        setPricingData({
          unitPrice: found.unitPrice,
          costPrice: found.costPrice,
        });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate(`/inventory/products/${id}`);
  };

  const handleBasicSubmit = (data: BasicInfoData) => {
    setBasicData(data);
    setActiveTab('pricing');
  };

  const handlePricingSubmit = () => {
    const data = getPricingValues();
    setPricingData(data);
    setActiveTab('inventory');
  };

  const handleInventorySubmit = async () => {
    getInventoryValues();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('Product updated successfully');
      navigate(`/inventory/products/${id}`);
    } catch {
      message.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <Button onClick={() => navigate('/inventory/products')}>Back to Products</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <form onSubmit={(e) => { e.preventDefault(); handleBasicSubmit(basicData!); }}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Product Name *</label>
            <Input
              {...registerBasic('name')}
              placeholder="Enter product name"
              status={errorsBasic.name ? 'error' : undefined}
            />
            {errorsBasic.name && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.name.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>SKU *</label>
            <Input
              {...registerBasic('sku')}
              placeholder="Enter SKU"
              status={errorsBasic.sku ? 'error' : undefined}
            />
            {errorsBasic.sku && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.sku.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Category *</label>
            <Select
              {...registerBasic('categoryId')}
              placeholder="Select category"
              style={{ width: '100%' }}
              options={categories}
              status={errorsBasic.categoryId ? 'error' : undefined}
            />
            {errorsBasic.categoryId && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.categoryId.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
            <Input.TextArea
              {...registerBasic('description')}
              rows={4}
              placeholder="Enter product description"
            />
          </div>

          <div className={styles.actions}>
            <Button onClick={handleBack}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      children: (
        <form onSubmit={(e) => { e.preventDefault(); handlePricingSubmit(); }}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Unit Price *</label>
            <Controller
              name="unitPrice"
              control={pricingControl}
              rules={{ required: true }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  status={errorsPricing.unitPrice ? 'error' : undefined}
                />
              )}
            />
            {errorsPricing.unitPrice && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.unitPrice.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Cost Price *</label>
            <Controller
              name="costPrice"
              control={pricingControl}
              rules={{ required: true }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  status={errorsPricing.costPrice ? 'error' : undefined}
                />
              )}
            />
            {errorsPricing.costPrice && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.costPrice.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('basic')}>Previous</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </form>
      ),
    },
    {
      key: 'inventory',
      label: 'Inventory',
      children: (
        <form onSubmit={(e) => { e.preventDefault(); handleInventorySubmit(); }}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Stock Quantity *</label>
            <Controller
              name="stockQuantity"
              control={inventoryControl}
              rules={{ required: true }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  status={errorsInventory.stockQuantity ? 'error' : undefined}
                />
              )}
            />
            {errorsInventory.stockQuantity && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.stockQuantity.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Reorder Point *</label>
            <Controller
              name="reorderPoint"
              control={inventoryControl}
              rules={{ required: true }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 0)}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  status={errorsInventory.reorderPoint ? 'error' : undefined}
                />
              )}
            />
            {errorsInventory.reorderPoint && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.reorderPoint.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('pricing')} disabled={isSubmitting}>Previous</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Update Product
            </Button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
          <h1 className={styles.title}>Edit Product</h1>
        </Space>
      </div>

      <Card className={styles.formCard}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default EditProductPage;
