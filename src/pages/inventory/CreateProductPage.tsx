import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Form, Input, InputNumber, Select, message } from 'antd';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreateProductDto } from '../../types/product.types';
import styles from './CreateProductPage.module.css';

const basicInfoSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  description: yup.string(),
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

const useProducts = () => {
  const createProduct = async (data: CreateProductDto) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    message.success('Product created successfully');
  };
  return { createProduct };
};

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerBasic, handleSubmit: handleSubmitBasic, formState: { errors: errorsBasic } } = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onBlur',
  });

  const { register: registerPricing, handleSubmit: handleSubmitPricing, formState: { errors: errorsPricing } } = useForm<PricingData>({
    resolver: yupResolver(pricingSchema),
    mode: 'onBlur',
  });

  const { register: registerInventory, handleSubmit: handleSubmitInventory, formState: { errors: errorsInventory } } = useForm<InventoryData>({
    resolver: yupResolver(inventorySchema),
    mode: 'onBlur',
  });

  const [basicData, setBasicData] = useState<BasicInfoData | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);

  const handleBasicSubmit = (data: BasicInfoData) => {
    setBasicData(data);
    setActiveTab('pricing');
  };

  const handlePricingSubmit = (data: PricingData) => {
    setPricingData(data);
    setActiveTab('inventory');
  };

  const handleInventorySubmit = async (data: InventoryData) => {
    setInventoryData(data);
    setIsSubmitting(true);
    try {
      if (basicData && pricingData) {
        await createProduct({
          name: basicData.name,
          sku: basicData.sku,
          description: basicData.description || '',
          categoryId: basicData.categoryId,
          unitPrice: pricingData.unitPrice,
          costPrice: pricingData.costPrice,
          stockQuantity: data.stockQuantity,
          reorderPoint: data.reorderPoint,
        });
        navigate('/inventory/products');
      }
    } catch (error) {
      message.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/products');
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <Form layout="vertical" onFinish={handleBasicSubmit}>
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
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      children: (
        <Form layout="vertical" onFinish={handlePricingSubmit}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Unit Price *</label>
            <InputNumber
              {...registerPricing('unitPrice')}
              prefix="$"
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="0.00"
              status={errorsPricing.unitPrice ? 'error' : undefined}
            />
            {errorsPricing.unitPrice && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.unitPrice.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Cost Price *</label>
            <InputNumber
              {...registerPricing('costPrice')}
              prefix="$"
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="0.00"
              status={errorsPricing.costPrice ? 'error' : undefined}
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
        </Form>
      ),
    },
    {
      key: 'inventory',
      label: 'Inventory',
      children: (
        <Form layout="vertical" onFinish={handleInventorySubmit}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Stock Quantity *</label>
            <InputNumber
              {...registerInventory('stockQuantity')}
              style={{ width: '100%' }}
              min={0}
              placeholder="0"
              status={errorsInventory.stockQuantity ? 'error' : undefined}
            />
            {errorsInventory.stockQuantity && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.stockQuantity.message}</span>
            )}
          </div>

          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Reorder Point *</label>
            <InputNumber
              {...registerInventory('reorderPoint')}
              style={{ width: '100%' }}
              min={0}
              placeholder="0"
              status={errorsInventory.reorderPoint ? 'error' : undefined}
            />
            {errorsInventory.reorderPoint && (
              <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.reorderPoint.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('pricing')} disabled={isSubmitting}>Previous</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create Product
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'images',
      label: 'Images',
      children: (
        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
          Image upload functionality coming soon
          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('inventory')}>Previous</Button>
            <Button type="primary" onClick={() => message.info('Please complete inventory tab first')}>
              Next
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Product</h1>
        <Button onClick={handleCancel}>Cancel</Button>
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

export default CreateProductPage;
