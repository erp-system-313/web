import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Tag, Space, Input, Modal, TreeSelect } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { Product, ProductFilters, StockStatus } from '../../types/product.types';
import type { Category } from '../../types/category.types';
import { useProducts } from '../../hooks/useProducts';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency } from '../../utils/formatters';
import styles from './ProductListPage.module.css';

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
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    inventoryService.getCategories(1, 100).then(res => {
      setCategories(res.data);
    }).catch(() => {});
  }, []);

  const categoryTreeData = buildCategoryTree(categories);

  const loadProducts = useCallback(async () => {
    await fetchProducts({ ...filters, search: searchText }, 1);
  }, [fetchProducts, filters, searchText]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId }));
  };

  const handleStockStatusFilter = (stockStatus: string) => {
    setFilters(prev => ({ ...prev, stockStatus: stockStatus ? stockStatus as StockStatus : undefined }));
  };

  const handleAddProduct = () => {
    navigate('/inventory/products/new');
  };

  const handleViewProduct = (id: number) => {
    navigate(`/inventory/products/${id}`);
  };

  const handleEditProduct = (id: number) => {
    navigate(`/inventory/products/${id}/edit`);
  };

  const handleDeleteProduct = (id: number) => {
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
    if (product.currentStock === 0) return <Tag color="error">Out of Stock</Tag>;
    if (product.currentStock <= product.reorderLevel) return <Tag color="warning">Low Stock</Tag>;
    return <Tag color="success">In Stock</Tag>;
  };

  const displayedProducts = useMemo(() => {
    if (!filters.stockStatus) return products;
    return products.filter(p => {
      const status = p.currentStock === 0 ? 'out_of_stock'
        : p.currentStock <= p.reorderLevel ? 'low_stock'
        : 'in_stock';
      return status === filters.stockStatus;
    });
  }, [products, filters.stockStatus]);

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
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName', render: (name: string | null) => name || 'None' },
    {
      title: 'Stock',
      key: 'stock',
      render: (_: unknown, record: Product) => (
        <div className={styles.stockSection}>
          <span className={styles.currentStock}>{record.currentStock} units</span>
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
          <TreeSelect placeholder="Category" allowClear style={{ width: 200 }} treeData={categoryTreeData} treeDefaultExpandAll onChange={handleCategoryFilter} />
          <Select placeholder="Stock Status" allowClear style={{ width: 150 }} options={stockStatusOptions} onChange={handleStockStatusFilter} />
        </Space>
      </Card>

      <Table columns={columns} dataSource={displayedProducts} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `Total ${total} products` }} />
    </div>
  );
};

export default ProductListPage;
