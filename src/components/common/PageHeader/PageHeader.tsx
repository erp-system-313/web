import { Space } from 'antd';
import type { ReactNode } from 'react';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, actions }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} style={{ marginBottom: 8 }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{title}</h1>
        {actions && (
          <Space>
            {actions}
          </Space>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
