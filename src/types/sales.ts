export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  creditLimit: number;
  paymentTerms: "NET_30" | "NET_60" | "IMMEDIATE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerContact {
  id: number;
  customerId: number;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  categoryId?: number;
  unitPrice: number;
  currentStock: number;
  isActive: boolean;
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  orderDate: string;
  requiredDate?: string;
  status: SalesOrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  shippingAddress?: string;
  paymentTerms?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  lines?: SalesOrderLine[];
}

export interface SalesOrderLine {
  id: number;
  orderId: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "SHIPPED"
  | "INVOICED"
  | "CANCELLED";

export interface CreateSalesOrderDto {
  customerId: number;
  orderDate: string;
  requiredDate?: string;
  status: SalesOrderStatus;
  notes?: string;
  shippingAddress?: string;
  paymentTerms?: string;
  lines: Omit<
    SalesOrderLine,
    "id" | "orderId" | "productName" | "productSku" | "lineTotal"
  >[];
}

export interface UpdateSalesOrderDto extends Partial<CreateSalesOrderDto> {}

export interface SalesOrderFilters {
  search?: string;
  status?: SalesOrderStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  creditLimitMin?: number;
  creditLimitMax?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
