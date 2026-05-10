import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import type { CSSProperties } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  style?: CSSProperties;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  products: 'Products',
  categories: 'Categories',
  purchasing: 'Purchasing',
  suppliers: 'Suppliers',
  orders: 'Orders',
  hr: 'HR',
  employees: 'Employees',
  attendance: 'Attendance',
  leave: 'Leave',
  finance: 'Finance',
  invoices: 'Invoices',
  journal: 'Journal',
  accounts: 'Accounts',
  sales: 'Sales',
  customers: 'Customers',
  admin: 'Admin',
  users: 'Users',
  settings: 'Settings',
  'audit-logs': 'Audit Logs',
  profile: 'Profile',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, style }) => {
  const location = useLocation();

  const crumbs = items
    ? items.map((item, i) => ({
        key: item.path || item.label,
        title: i < items.length - 1 && item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
      }))
    : location.pathname
        .split('/')
        .filter(Boolean)
        .map((segment, i, arr) => {
          const path = '/' + arr.slice(0, i + 1).join('/');
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
          const isLast = i === arr.length - 1;
          return {
            key: path,
            title: isLast ? label : <Link to={path}>{label}</Link>,
          };
        });

  return (
    <div style={style}>
      <Breadcrumb items={[{ key: 'home', title: <Link to="/dashboard">Home</Link> }, ...crumbs]} />
    </div>
  );
};

export default Breadcrumbs;
