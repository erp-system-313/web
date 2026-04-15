import React from "react";
import { Tag } from "antd";
import type { SalesOrderStatus } from "../../../types/sales";
import type { InvoiceStatus, JournalEntryStatus } from "../../../types/finance";
import styles from "./StatusBadge.module.css";

type Status =
  | SalesOrderStatus
  | InvoiceStatus
  | JournalEntryStatus
  | "ACTIVE"
  | "INACTIVE"
  | boolean;

const statusConfig: Record<string, { color: string; label: string }> = {
  DRAFT: { color: "default", label: "Draft" },
  CONFIRMED: { color: "processing", label: "Confirmed" },
  SHIPPED: { color: "cyan", label: "Shipped" },
  INVOICED: { color: "green", label: "Invoiced" },
  CANCELLED: { color: "red", label: "Cancelled" },
  PENDING: { color: "orange", label: "Pending" },
  APPROVED: { color: "green", label: "Approved" },
  REJECTED: { color: "red", label: "Rejected" },
  PAID: { color: "green", label: "Paid" },
  OVERDUE: { color: "red", label: "Overdue" },
  SENT: { color: "blue", label: "Sent" },
  ACTIVE: { color: "green", label: "Active" },
  INACTIVE: { color: "default", label: "Inactive" },
  true: { color: "green", label: "Active" },
  false: { color: "default", label: "Inactive" },
};

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[String(status)] || {
    color: "default",
    label: String(status),
  };

  return (
    <Tag className={styles.badge} color={config.color}>
      {config.label}
    </Tag>
  );
};

export default StatusBadge;
