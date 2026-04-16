import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const items: MenuProps['items'] = [
    {
      key: '/inventory',
      label: 'Inventory',
      children: [
        { key: '/inventory/products', label: <Link to="/inventory/products">Products</Link> },
        { key: '/inventory/categories', label: <Link to="/inventory/categories">Categories</Link> },
      ],
    },
    {
      key: '/purchasing',
      label: 'Purchasing',
      children: [
        { key: '/purchasing/suppliers', label: <Link to="/purchasing/suppliers">Suppliers</Link> },
        { key: '/purchasing/orders', label: <Link to="/purchasing/orders">Purchase Orders</Link> },
      ],
    },
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/inventory')) return ['/inventory'];
    if (path.startsWith('/purchasing')) return ['/purchasing'];
    return [];
  };

  return (
    <div style={{ padding: '0 24px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 1400, margin: '0 auto' }}>
        <h2 style={{ margin: '16px 24px 16px 0', fontWeight: 600 }}>ERP System</h2>
        <Menu
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          items={items}
          style={{ border: 'none', flex: 1 }}
        />
      </div>
    </div>
  );
};

export default Navigation;
