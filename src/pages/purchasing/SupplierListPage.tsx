import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Table, Input, Space, message, Rate } from 'antd';
import { PlusOutlined, EyeOutlined, ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import type { Supplier, SupplierFilters } from '../../types/supplier.types';
import styles from './SupplierListPage.module.css';

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  fetchSuppliers: (filters: SupplierFilters, page: number) => Promise<void>;
}

const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'TechSupply Co.',
      contactPerson: 'John Smith',
      email: 'john@techsupply.com',
      phone: '+1 555-0101',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
      paymentTerms: 'Net 30',
      rating: 5,
      totalOrders: 45,
      onTimeDelivery: 98,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Global Parts Ltd.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@globalparts.com',
      phone: '+1 555-0102',
      address: '456 Industrial Ave',
      city: 'New York',
      country: 'USA',
      paymentTerms: 'Net 60',
      rating: 4,
      totalOrders: 32,
      onTimeDelivery: 92,
      isActive: true,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: '3',
      name: 'Quality Electronics',
      contactPerson: 'Mike Chen',
      email: 'mike@qualityelec.com',
      phone: '+1 555-0103',
      address: '789 Circuit Road',
      city: 'Los Angeles',
      country: 'USA',
      paymentTerms: 'Net 30',
      rating: 5,
      totalOrders: 67,
      onTimeDelivery: 95,
      isActive: true,
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
    },
    {
      id: '4',
      name: 'Office Solutions Inc.',
      contactPerson: 'Emily Davis',
      email: 'emily@officesol.com',
      phone: '+1 555-0104',
      address: '321 Commerce Blvd',
      city: 'Chicago',
      country: 'USA',
      paymentTerms: 'COD',
      rating: 3,
      totalOrders: 18,
      onTimeDelivery: 88,
      isActive: true,
      createdAt: '2024-01-18T10:00:00Z',
      updatedAt: '2024-01-18T10:00:00Z',
    },
  ];

  const fetchSuppliers = useCallback(async (filters: SupplierFilters, _page: number) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockSuppliers];
    
    if (filters.name) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(filters.name!.toLowerCase()));
    }
    if (filters.city) {
      filtered = filtered.filter(s => s.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.rating) {
      filtered = filtered.filter(s => s.rating >= filters.rating!);
    }

    setSuppliers(filtered);
    setLoading(false);
  }, []);

  return { suppliers, loading, fetchSuppliers };
};

const ratingOptions = [
  { value: 0, label: 'All Ratings' },
  { value: 5, label: '★★★★★ (5)' },
  { value: 4, label: '★★★★☆ (4+)' },
  { value: 3, label: '★★★☆☆ (3+)' },
];

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading, fetchSuppliers } = useSuppliers();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [searchText, setSearchText] = useState('');

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers({ ...filters, name: searchText }, 1);
  }, [fetchSuppliers, filters, searchText]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCityFilter = (city: string) => {
    setFilters(prev => ({ ...prev, city: city || undefined }));
  };

  const handleRatingFilter = (rating: number) => {
    setFilters(prev => ({ ...prev, rating: rating || undefined }));
  };

  const handleViewSupplier = (id: string) => {
    navigate(`/purchasing/suppliers/${id}`);
  };

  const handleCreatePO = (supplierId: string) => {
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
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
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
          <Input
            placeholder="Filter by city"
            allowClear
            style={{ width: 180 }}
            onChange={(e) => handleCityFilter(e.target.value)}
          />
          <Select
            placeholder="Rating"
            allowClear
            style={{ width: 150 }}
            options={ratingOptions}
            onChange={handleRatingFilter}
          />
          <Space className={styles.viewToggle}>
            <Button.Group>
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              <Button 
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
            </Button.Group>
          </Space>
        </Space>
      </Card>

      {viewMode === 'list' ? (
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
      ) : (
        <div className={styles.supplierGrid}>
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className={styles.supplierCard}
              title={supplier.name}
              extra={
                <Rate disabled defaultValue={supplier.rating} style={{ fontSize: 12 }} />
              }
              actions={[
                <Button key="view" icon={<EyeOutlined />} onClick={() => handleViewSupplier(supplier.id)}>View</Button>,
                <Button key="po" icon={<ShoppingCartOutlined />} onClick={() => handleCreatePO(supplier.id)}>Create PO</Button>,
              ]}
            >
              <div className={styles.supplierInfo}>
                <p><strong>Contact:</strong> {supplier.contactPerson}</p>
                <p><strong>Phone:</strong> {supplier.phone}</p>
                <p><strong>Email:</strong> {supplier.email}</p>
                <p><strong>City:</strong> {supplier.city}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {suppliers.length === 0 && !loading && (
        <div className={styles.emptyState}>
          No suppliers found. Click "Add Supplier" to create one.
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
