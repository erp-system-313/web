export type PurchaseOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  status: PurchaseOrderStatus;
  paymentTerms: string;
  notes: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplierId?: string;
  search?: string;
}
