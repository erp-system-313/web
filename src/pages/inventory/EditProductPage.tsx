import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Tabs, Input, InputNumber, Spin, message, TreeSelect } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useProducts } from '../../hooks/useProducts';
import { inventoryService } from '../../services/inventoryService';
import type { CreateProductDto } from '../../types/product.types';
import type { Category } from '../../types/category.types';
import styles from './EditProductPage.module.css';

const basicInfoSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  description: yup.string().default(''),
  categoryId: yup.number().required('Category is required').typeError('Category is required'),
});

const pricingSchema = yup.object({
  unitPrice: yup.number().required('Unit price is required').min(0, 'Price must be positive'),
  costPrice: yup.number().required('Cost price is required').min(0, 'Price must be positive'),
});

const inventorySchema = yup.object({
  currentStock: yup.number().required('Stock quantity is required').min(0, 'Quantity must be positive'),
  reorderLevel: yup.number().required('Reorder point is required').min(0, 'Must be positive'),
});

type BasicInfoData = yup.InferType<typeof basicInfoSchema>;
type PricingData = yup.InferType<typeof pricingSchema>;
type InventoryData = yup.InferType<typeof inventorySchema>;

function buildCategoryTree(categories: Category[]): { value: number; title: string; children?: { value: number; title: string }[] }[] {
  const parents = categories.filter(c => c.parentId === null).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return parents.map(parent => {
    const children = categories.filter(c => c.parentId === parent.id).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return {
      value: parent.id,
      title: parent.name,
      children: children.length > 0 ? children.map(c => ({ value: c.id, title: c.name })) : undefined,
    };
  });
}

export const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProduct, updateProduct } = useProducts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalData = useRef<CreateProductDto | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    inventoryService.getCategories(1, 100).then(res => {
      setCategories(res.data);
    }).catch(() => {});
  }, []);

  const categoryTreeData = buildCategoryTree(categories);

  const { control: basicControl, handleSubmit: handleBasicSubmit, formState: { errors: errorsBasic }, reset: resetBasic } = useForm<BasicInfoData>({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onBlur',
    defaultValues: { name: '', sku: '', description: '', categoryId: undefined },
  });

  const { control: pricingControl, handleSubmit: handlePricingSubmit, formState: { errors: errorsPricing }, reset: resetPricing } = useForm<PricingData>({
    resolver: yupResolver(pricingSchema),
    mode: 'onBlur',
  });

  const { control: inventoryControl, handleSubmit: handleInventorySubmit, formState: { errors: errorsInventory }, reset: resetInventory } = useForm<InventoryData>({
    resolver: yupResolver(inventorySchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const product = await getProduct(Number(id));
        if (product) {
          const basic = { name: product.name, sku: product.sku, description: product.description || '', categoryId: Number(product.categoryId) };
          const pricing = { unitPrice: product.unitPrice, costPrice: product.costPrice };
          const inventory = { currentStock: product.currentStock, reorderLevel: product.reorderLevel };
          originalData.current = { ...basic, ...pricing, ...inventory };
          resetBasic(basic);
          resetPricing(pricing);
          resetInventory(inventory);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, resetBasic, resetPricing, resetInventory, getProduct]);

  const saveProduct = async (basic: BasicInfoData, pricing: PricingData, inventory: InventoryData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateProduct(Number(id), {
        name: basic.name,
        sku: basic.sku,
        description: basic.description || '',
        categoryId: basic.categoryId,
        unitPrice: pricing.unitPrice,
        costPrice: pricing.costPrice,
        currentStock: inventory.currentStock,
        reorderLevel: inventory.reorderLevel,
      });
      navigate('/inventory/products');
    } catch {
      message.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBasicSubmit = (data: BasicInfoData) => {
    const fallback = originalData.current;
    saveProduct(
      data,
      { unitPrice: fallback?.unitPrice ?? 0, costPrice: fallback?.costPrice ?? 0 },
      { currentStock: fallback?.currentStock ?? 0, reorderLevel: fallback?.reorderLevel ?? 0 },
    );
  };

  const onPricingSubmit = (data: PricingData) => {
    const fallback = originalData.current;
    saveProduct(
      { name: fallback?.name ?? '', sku: fallback?.sku ?? '', description: fallback?.description ?? '', categoryId: fallback?.categoryId ?? 0 },
      data,
      { currentStock: fallback?.currentStock ?? 0, reorderLevel: fallback?.reorderLevel ?? 0 },
    );
  };

  const onInventorySubmit = (data: InventoryData) => {
    const fallback = originalData.current;
    saveProduct(
      { name: fallback?.name ?? '', sku: fallback?.sku ?? '', description: fallback?.description ?? '', categoryId: fallback?.categoryId ?? 0 },
      { unitPrice: fallback?.unitPrice ?? 0, costPrice: fallback?.costPrice ?? 0 },
      data,
    );
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
  }

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <form onSubmit={handleBasicSubmit(onBasicSubmit)}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Product Name *</label>
            <Controller name="name" control={basicControl} render={({ field }) => (
              <Input {...field} placeholder="Enter product name" status={errorsBasic.name ? 'error' : undefined} />
            )} />
            {errorsBasic.name && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.name.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>SKU *</label>
            <Controller name="sku" control={basicControl} render={({ field }) => (
              <Input {...field} placeholder="Enter SKU" status={errorsBasic.sku ? 'error' : undefined} />
            )} />
            {errorsBasic.sku && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.sku.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Category *</label>
            <Controller name="categoryId" control={basicControl} render={({ field }) => (
              <TreeSelect {...field} onChange={(value) => field.onChange(value)} placeholder="Select category" style={{ width: '100%' }} treeData={categoryTreeData} treeDefaultExpandAll status={errorsBasic.categoryId ? 'error' : undefined} />
            )} />
            {errorsBasic.categoryId && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsBasic.categoryId.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
            <Controller name="description" control={basicControl} render={({ field }) => (
              <Input.TextArea {...field} rows={4} placeholder="Enter product description" />
            )} />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/inventory/products')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Update Product</Button>
          </div>
        </form>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      children: (
        <form onSubmit={handlePricingSubmit(onPricingSubmit)}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Unit Price *</label>
            <Controller name="unitPrice" control={pricingControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? undefined)} prefix="$" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" status={errorsPricing.unitPrice ? 'error' : undefined} />
            )} />
            {errorsPricing.unitPrice && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.unitPrice.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Cost Price *</label>
            <Controller name="costPrice" control={pricingControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? undefined)} prefix="$" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" status={errorsPricing.costPrice ? 'error' : undefined} />
            )} />
            {errorsPricing.costPrice && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsPricing.costPrice.message}</span>}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/inventory/products')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Update Product</Button>
          </div>
        </form>
      ),
    },
    {
      key: 'inventory',
      label: 'Inventory',
      children: (
        <form onSubmit={handleInventorySubmit(onInventorySubmit)}>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Stock Quantity *</label>
            <Controller name="currentStock" control={inventoryControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? undefined)} style={{ width: '100%' }} min={0} placeholder="0" status={errorsInventory.currentStock ? 'error' : undefined} />
            )} />
            {errorsInventory.currentStock && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.currentStock.message}</span>}
          </div>
          <div className={styles.formItem}>
            <label style={{ display: 'block', marginBottom: 8 }}>Reorder Point *</label>
            <Controller name="reorderLevel" control={inventoryControl} render={({ field }) => (
              <InputNumber {...field} onChange={(value) => field.onChange(value ?? undefined)} style={{ width: '100%' }} min={0} placeholder="0" status={errorsInventory.reorderLevel ? 'error' : undefined} />
            )} />
            {errorsInventory.reorderLevel && <span style={{ color: '#ff4d4f', fontSize: 12 }}>{errorsInventory.reorderLevel.message}</span>}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/inventory/products')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Update Product</Button>
          </div>
        </form>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Product</h1>
      </div>
      <Card className={styles.formCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default EditProductPage;
