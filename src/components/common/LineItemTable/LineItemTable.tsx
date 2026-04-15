import React from "react";
import { Table, InputNumber, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnType } from "antd";
import styles from "./LineItemTable.module.css";

export interface LineItem {
  id: string;
  productId?: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface LineItemTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export const LineItemTable: React.FC<LineItemTableProps> = ({
  items,
  onChange,
  disabled = false,
}) => {
  const handleQuantityChange = (id: string, quantity: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, quantity, lineTotal: quantity * item.unitPrice };
      }
      return item;
    });
    onChange(updated);
  };

  const handlePriceChange = (id: string, unitPrice: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, unitPrice, lineTotal: item.quantity * unitPrice };
      }
      return item;
    });
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onChange(updated);
  };

  const handleAdd = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      productId: undefined,
      productName: undefined,
      productSku: undefined,
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    };
    onChange([...items, newItem]);
  };

  const columns: TableColumnType<LineItem>[] = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name: string) => name || "Select a product",
      width: "35%",
    },
    {
      title: "SKU",
      dataIndex: "productSku",
      key: "productSku",
      render: (sku: string) => sku || "-",
      width: "15%",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (qty: number, record: LineItem) => (
        <InputNumber
          min={1}
          value={qty}
          onChange={(val) => val && handleQuantityChange(record.id, val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "15%",
      render: (price: number, record: LineItem) => (
        <InputNumber
          min={0}
          step={0.01}
          prefix="$"
          value={price}
          onChange={(val) => val !== null && handlePriceChange(record.id, val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: "Line Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      width: "15%",
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: "",
      key: "actions",
      width: "5%",
      render: (_: unknown, record: LineItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
          disabled={disabled}
        />
      ),
    },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className={styles.container}>
      <Table
        className={styles.table}
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="id"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>Totals</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>${subtotal.toFixed(2)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <strong>${total.toFixed(2)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <div className={styles.addRow}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={disabled}
        >
          Add Line Item
        </Button>
      </div>
    </div>
  );
};

export default LineItemTable;
