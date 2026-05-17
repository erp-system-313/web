export type PurchaseOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "RECEIVED"
  | "CANCELLED"
  | "DRAFT"
  | "SENT"
  | "PARTIAL";

export interface PurchaseOrderLineItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  receivedQty: number;
  notes: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  shippingCost: number;
  receivedDate?: string;
  notes: string;
  lines: PurchaseOrderLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  orderDate: string;
  expectedDate?: string;
  notes: string;
  lines: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    discount: number;
    notes: string;
  }>;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplierId?: number;
  search?: string;
}
