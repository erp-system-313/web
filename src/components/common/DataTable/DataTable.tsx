import React from "react";
import { Table, Card, Space, Button, Input } from "antd";
import type { TableProps, TableColumnType } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./DataTable.module.css";

interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: TableColumnType<T>[];
  loading?: boolean;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
  rowKey?: string;
  pagination?: TableProps<T>["pagination"];
  onRow?: TableProps<T>["onRow"];
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  loading = false,
  onRefresh,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  rowKey = "id",
  pagination = { pageSize: 10 },
  onRow,
  selectedRowKeys,
  onSelectionChange,
}: DataTableProps<T>) {
  const handleSearch = (value: string) => {
    onSearch?.(value);
  };

  const rowSelection = selectedRowKeys
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => {
          onSelectionChange?.(keys);
        },
      }
    : undefined;

  return (
    <Card className={styles.card} bordered={false}>
      {(onSearch || onRefresh || actions) && (
        <div className={styles.toolbar}>
          <Space>
            {onSearch && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
                allowClear
              />
            )}
            {actions}
          </Space>
          <Space>
            {onRefresh && (
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </Space>
        </div>
      )}
      <Table
        className={styles.table}
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        onRow={onRow}
        rowSelection={rowSelection}
      />
    </Card>
  );
}

export default DataTable;
