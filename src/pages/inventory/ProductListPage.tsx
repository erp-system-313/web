import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Tag, Space, Input, Modal, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Product, ProductFilters, StockStatus } from '../../types/product.types';
import { formatCurrency } from '../../utils/formatters';
import styles from './ProductListPage.module.css';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  total: number;
  fetchProducts: (filters: ProductFilters, page: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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

  const fetchProducts = useCallback(async (filters: ProductFilters, page: number) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockProducts];
    
    if (filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.sku.toLowerCase().includes(search)
      );
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.unitPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.unitPrice <= filters.maxPrice!);
    }
    if (filters.stockStatus) {
      filtered = filtered.filter(p => {
        if (filters.stockStatus === 'out_of_stock') return p.stockQuantity === 0;
        if (filters.stockStatus === 'low_stock') return p.stockQuantity > 0 && p.stockQuantity <= p.reorderPoint;
        return p.stockQuantity > p.reorderPoint;
      });
    }

    setProducts(filtered);
    setTotal(filtered.length);
    setLoading(false);
  }, []);

  const deleteProduct = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('Product deleted successfully');
  };

  return { products, loading, total, fetchProducts, deleteProduct };
};

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'clothing', label: 'Clothing' },
];

const stockStatusOptions = [
  { value: '', label: 'All' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, total, fetchProducts, deleteProduct } = useProducts();
  
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
    setFilters(prev => ({ 
      ...prev, 
      stockStatus: stockStatus ? stockStatus as StockStatus : undefined 
    }));
  };

  const handlePriceRangeFilter = (minPrice: number | undefined, maxPrice: number | undefined) => {
    setFilters(prev => ({ ...prev, minPrice, maxPrice }));
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
    if (product.stockQuantity === 0) {
      return <Tag color="error">Out of Stock</Tag>;
    }
    if (product.stockQuantity <= product.reorderPoint) {
      return <Tag color="warning">Low Stock</Tag>;
    }
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
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
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
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewProduct(record.id)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditProduct(record.id)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteProduct(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
          Add Product
        </Button>
      </div>

      <Card className={styles.filterPanel}>
        <Space size="large" wrap>
          <Input.Search
            placeholder="Search products by name or SKU..."
            allowClear
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Category"
            allowClear
            style={{ width: 200 }}
            options={categories}
            onChange={handleCategoryFilter}
          />
          <Select
            placeholder="Stock Status"
            allowClear
            style={{ width: 150 }}
            options={stockStatusOptions}
            onChange={handleStockStatusFilter}
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} products`,
        }}
      />
    </div>
  );
};

export default ProductListPage;
