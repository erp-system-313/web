import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Tag, Space, Input, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { Product, ProductFilters, StockStatus } from '../../types/product.types';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import styles from './ProductListPage.module.css';

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'office', label: 'Office Supplies' },
];

const stockStatusOptions = [
  { value: '', label: 'All' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchText, setSearchText] = useState('');

  const loadProducts = useCallback(async () => {
    await fetchProducts({ ...filters, search: searchText }, 1);
  }, [fetchProducts, filters, searchText]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId: categoryId || undefined }));
  };

  const handleStockStatusFilter = (stockStatus: string) => {
    setFilters(prev => ({ ...prev, stockStatus: stockStatus ? stockStatus as StockStatus : undefined }));
  };

  const handleAddProduct = () => {
    navigate('/inventory/products/new');
  };

  const handleViewProduct = (id: string) => {
    navigate(`/inventory/products/${id}`);
  };

  const handleEditProduct = (id: string) => {
    navigate(`/inventory/products/${id}/edit`);
  };

  const handleDeleteProduct = (id: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteProduct(id);
      },
    });
  };

  const getStockTag = (product: Product) => {
    if (product.stockQuantity === 0) return <Tag color="error">Out of Stock</Tag>;
    if (product.stockQuantity <= product.reorderPoint) return <Tag color="warning">Low Stock</Tag>;
    return <Tag color="success">In Stock</Tag>;
  };

  const columns = [
    {
      title: 'Product Info',
      key: 'productInfo',
      render: (_: unknown, record: Product) => (
        <div className={styles.productInfo}>
          <span className={styles.productName}>{record.name}</span>
          <span className={styles.productDescription}>{record.description}</span>
        </div>
      ),
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
    {
      title: 'Stock',
      key: 'stock',
      render: (_: unknown, record: Product) => (
        <div className={styles.stockSection}>
          <span className={styles.stockQuantity}>{record.stockQuantity} units</span>
          {getStockTag(record)}
        </div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: unknown, record: Product) => (
        <div className={styles.priceSection}>
          <span className={styles.priceMain}>{formatCurrency(record.unitPrice)}</span>
          <span className={styles.priceCost}>Cost: {formatCurrency(record.costPrice)}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space className={styles.tableActions}>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewProduct(record.id)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditProduct(record.id)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>Add Product</Button>
      </div>

      <Card className={styles.filterPanel}>
        <Space size="large" wrap>
          <Input.Search placeholder="Search products..." allowClear prefix={<SearchOutlined />} onSearch={handleSearch} style={{ width: 300 }} />
          <Select placeholder="Category" allowClear style={{ width: 200 }} options={categories} onChange={handleCategoryFilter} />
          <Select placeholder="Stock Status" allowClear style={{ width: 150 }} options={stockStatusOptions} onChange={handleStockStatusFilter} />
        </Space>
      </Card>

      <Table columns={columns} dataSource={products} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Total ${total} products` }} />
    </div>
  );
};

export default ProductListPage;
