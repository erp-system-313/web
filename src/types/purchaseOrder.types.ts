export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: number;
  orderId?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  lineTotal: number;
  receivedQty?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  status: PurchaseOrderStatus;
  notes: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  orderDate: string;
  expectedDate: string;
  notes: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplierId?: number;
  search?: string;
}
