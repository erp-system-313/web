import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space, message, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Product } from '../../types/product.types';
import { formatCurrency } from '../../utils/formatters';
import styles from './ProductDetailsPage.module.css';

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

const getStockStatus = (product: Product) => {
  if (product.stockQuantity === 0) {
    return { color: 'error', text: 'Out of Stock' };
  }
  if (product.stockQuantity <= product.reorderPoint) {
    return { color: 'warning', text: 'Low Stock' };
  }
  return { color: 'success', text: 'In Stock' };
};

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const found = mockProducts.find(p => p.id === id);
      setProduct(found || null);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate('/inventory/products');
  };

  const handleEdit = () => {
    navigate(`/inventory/products/${id}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        message.success('Product deleted successfully');
        navigate('/inventory/products');
      },
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <Button onClick={handleBack}>Back to Products</Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product);

  return (
    <div>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
          <h1 className={styles.title}>{product.name}</h1>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <Card title="Product Information">
          <Descriptions column={2}>
            <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
            <Descriptions.Item label="Category">{product.categoryName}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {product.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={product.isActive ? 'success' : 'default'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Stock Status">
              <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Pricing" className={styles.card}>
          <Descriptions column={2}>
            <Descriptions.Item label="Unit Price">
              {formatCurrency(product.unitPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Cost Price">
              {formatCurrency(product.costPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Profit Margin">
              {formatCurrency(product.unitPrice - product.costPrice)}
              <span className={styles.marginPercent}>
                ({((product.unitPrice - product.costPrice) / product.unitPrice * 100).toFixed(1)}%)
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Inventory" className={styles.card}>
          <Descriptions column={2}>
            <Descriptions.Item label="Current Stock">
              <span className={stockStatus.color === 'error' ? styles.lowStock : ''}>
                {product.stockQuantity} units
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Reorder Point">
              {product.reorderPoint} units
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Metadata" className={styles.card}>
          <Descriptions column={2}>
            <Descriptions.Item label="Created">
              {new Date(product.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(product.updatedAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
