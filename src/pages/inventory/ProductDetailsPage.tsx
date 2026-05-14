import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space, Spin, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Product } from '../../types/product.types';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import styles from './ProductDetailsPage.module.css';

const getStockStatus = (product: Product) => {
  if (product.currentStock === 0) {
    return { color: 'error', text: 'Out of Stock' };
  }
  if (product.currentStock <= product.reorderLevel) {
    return { color: 'warning', text: 'Low Stock' };
  }
  return { color: 'success', text: 'In Stock' };
};

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, deleteProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProduct(Number(id));
        setProduct(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, getProduct]);

  const handleBack = () => {
    navigate('/inventory/products');
  };

  const handleEdit = () => {
    navigate(`/inventory/products/${id}/edit`);
  };

  const handleDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteProduct(Number(id));
        navigate('/inventory/products');
      },
    });
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
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
                {product.currentStock} units
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Reorder Point">
              {product.reorderLevel} units
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
