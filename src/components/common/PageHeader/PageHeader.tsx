import React from "react";
import { Breadcrumb, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import styles from "./PageHeader.module.css";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  const breadcrumbItems =
    breadcrumbs?.map((item) => ({
      title: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
    })) ?? [];

  return (
    <div className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className={styles.breadcrumb} items={breadcrumbItems} />
      )}
      <div className={styles.row}>
        <div className={styles.titleSection}>
          <Typography.Title level={4} className={styles.title}>
            {title}
          </Typography.Title>
          {subtitle && (
            <Typography.Text type="secondary" className={styles.subtitle}>
              {subtitle}
            </Typography.Text>
          )}
        </div>
        {actions && <Space>{actions}</Space>}
      </div>
    </div>
  );
};

export default PageHeader;
