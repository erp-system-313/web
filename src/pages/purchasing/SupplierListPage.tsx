import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, Input, Space, message } from 'antd';
import { PlusOutlined, EyeOutlined, ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import type { Supplier } from '../../types/supplier.types';
import { useSuppliers } from '../../hooks/useSuppliers';
import styles from './SupplierListPage.module.css';

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading, fetchSuppliers } = useSuppliers();
  
  const [searchText, setSearchText] = useState('');

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers({ search: searchText || undefined }, 1);
  }, [fetchSuppliers, searchText]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleViewSupplier = (id: number) => {
    navigate(`/purchasing/suppliers/${id}`);
  };

  const handleCreatePO = (supplierId: number) => {
    navigate(`/purchasing/orders/new?supplier=${supplierId}`);
  };

  const handleAddSupplier = () => {
    message.info('Add supplier form coming soon');
  };

  const listColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Supplier) => (
        <Space className={styles.tableActions}>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewSupplier(record.id)} />
          <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => handleCreatePO(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Suppliers</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSupplier}>
          Add Supplier
        </Button>
      </div>

      <Card className={styles.filterBar}>
        <Space size="large" wrap>
          <Input.Search
            placeholder="Search suppliers by name..."
            allowClear
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 280 }}
          />
        </Space>
      </Card>

      <Table
        columns={listColumns}
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} suppliers`,
        }}
      />

      {suppliers.length === 0 && !loading && (
        <div className={styles.emptyState}>
          No suppliers found. Click "Add Supplier" to create one.
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
