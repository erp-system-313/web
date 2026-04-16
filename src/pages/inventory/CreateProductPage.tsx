import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Input, InputNumber, Select } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProducts } from '../../hooks/useProducts';
import styles from './CreateProductPage.module.css';

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
];

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerBasic, formState: { errors: errorsBasic } } = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onBlur',
  });

  const { control: pricingControl, formState: { errors: errorsPricing }, getValues: getPricingValues } = useForm<PricingData>({
    resolver: yupResolver(pricingSchema),
    mode: 'onBlur',
    defaultValues: { unitPrice: 0, costPrice: 0 },
  });

  const { control: inventoryControl, formState: { errors: errorsInventory }, getValues: getInventoryValues } = useForm<InventoryData>({
    resolver: yupResolver(inventorySchema),
    mode: 'onBlur',
    defaultValues: { stockQuantity: 0, reorderPoint: 0 },
  });

  const [basicData, setBasicData] = useState<BasicInfoData | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

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
    const inventoryValues = getInventoryValues();
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
          stockQuantity: inventoryValues.stockQuantity,
          reorderPoint: inventoryValues.reorderPoint,
        });
        navigate('/inventory/products');
      }
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <form onSubmit={(e) => { e.preventDefault(); handleBasicSubmit(basicData!); }}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Product Name *</label>
            <Input {...registerBasic('name')} placeholder="Enter product name" status={errorsBasic.name ? 'error' : undefined} />
            {errorsBasic.name && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.name.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>SKU *</label>
            <Input {...registerBasic('sku')} placeholder="Enter SKU" status={errorsBasic.sku ? 'error' : undefined} />
            {errorsBasic.sku && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.sku.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Category *</label>
            <Select {...registerBasic('categoryId')} placeholder="Select category" style={{ width: '100%' }} options={categories} status={errorsBasic.categoryId ? 'error' : undefined} />
            {errorsBasic.categoryId && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.categoryId.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
            <Input.TextArea {...registerBasic('description')} rows={4} placeholder="Enter product description" />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/inventory/products')}>Cancel</Button>
            <Button type="primary" htmlType="submit">Next</Button>
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
            <Controller name="unitPrice" control={pricingControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? 0)} prefix="$" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" status={errorsPricing.unitPrice ? 'error' : undefined} />
            )} />
            {errorsPricing.unitPrice && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.unitPrice.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Cost Price *</label>
            <Controller name="costPrice" control={pricingControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? 0)} prefix="$" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" status={errorsPricing.costPrice ? 'error' : undefined} />
            )} />
            {errorsPricing.costPrice && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.costPrice.message}</span>}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('basic')}>Previous</Button>
            <Button type="primary" htmlType="submit">Next</Button>
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
            <Controller name="stockQuantity" control={inventoryControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? 0)} style={{ width: '100%' }} min={0} placeholder="0" status={errorsInventory.stockQuantity ? 'error' : undefined} />
            )} />
            {errorsInventory.stockQuantity && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.stockQuantity.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Reorder Point *</label>
            <Controller name="reorderPoint" control={inventoryControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? 0)} style={{ width: '100%' }} min={0} placeholder="0" status={errorsInventory.reorderPoint ? 'error' : undefined} />
            )} />
            {errorsInventory.reorderPoint && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.reorderPoint.message}</span>}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setActiveTab('pricing')} disabled={isSubmitting}>Previous</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Create Product</Button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Product</h1>
        <Button onClick={() => navigate('/inventory/products')}>Cancel</Button>
      </div>
      <Card className={styles.formCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default CreateProductPage;
