export interface Supplier {
  id: number;
  code?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  paymentTerms: number;
  totalPurchased?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFilters {
  name?: string;
  search?: string;
  status?: string;
  isActive?: boolean;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: number;
}
