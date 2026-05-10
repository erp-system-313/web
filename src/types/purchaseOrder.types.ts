export type PurchaseOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "RECEIVED"
  | "CANCELLED";

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
  deliveryDate: string;
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
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
  status: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    discount: number;
    notes: string;
  }>;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplierId?: number;
  search?: string;
}
