import type { Supplier, CreateSupplierDto, SupplierFilters } from '../types/supplier.types';
import type { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderFilters } from '../types/purchaseOrder.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'TechSupply Co.',
    contactPerson: 'John Smith',
    email: 'john@techsupply.com',
    phone: '+1 555-0101',
    address: '123 Tech Street',
    city: 'San Francisco',
    country: 'USA',
    paymentTerms: 'Net 30',
    rating: 5,
    totalOrders: 45,
    onTimeDelivery: 98,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Global Parts Ltd.',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@globalparts.com',
    phone: '+1 555-0102',
    address: '456 Industrial Ave',
    city: 'New York',
    country: 'USA',
    paymentTerms: 'Net 60',
    rating: 4,
    totalOrders: 32,
    onTimeDelivery: 92,
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Quality Electronics',
    contactPerson: 'Mike Chen',
    email: 'mike@qualityelec.com',
    phone: '+1 555-0103',
    address: '789 Circuit Road',
    city: 'Los Angeles',
    country: 'USA',
    paymentTerms: 'Net 30',
    rating: 5,
    totalOrders: 67,
    onTimeDelivery: 95,
    isActive: true,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    name: 'Office Solutions Inc.',
    contactPerson: 'Emily Davis',
    email: 'emily@officesol.com',
    phone: '+1 555-0104',
    address: '321 Commerce Blvd',
    city: 'Chicago',
    country: 'USA',
    paymentTerms: 'COD',
    rating: 3,
    totalOrders: 18,
    onTimeDelivery: 88,
    isActive: true,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
];

const mockOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplierId: '1',
    supplierName: 'TechSupply Co.',
    orderDate: '2024-01-15T10:00:00Z',
    deliveryDate: '2024-01-25T10:00:00Z',
    status: 'delivered',
    paymentTerms: 'Net 30',
    notes: 'Urgent order',
    items: [],
    subtotal: 1500.00,
    taxAmount: 150.00,
    shippingCost: 50.00,
    totalAmount: 1700.00,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    supplierId: '2',
    supplierName: 'Global Parts Ltd.',
    orderDate: '2024-01-16T10:00:00Z',
    deliveryDate: '2024-01-30T10:00:00Z',
    status: 'shipped',
    paymentTerms: 'Net 60',
    notes: '',
    items: [],
    subtotal: 2500.00,
    taxAmount: 250.00,
    shippingCost: 75.00,
    totalAmount: 2825.00,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    supplierId: '3',
    supplierName: 'Quality Electronics',
    orderDate: '2024-01-17T10:00:00Z',
    deliveryDate: '2024-01-28T10:00:00Z',
    status: 'confirmed',
    paymentTerms: 'Net 30',
    notes: 'Handle with care',
    items: [],
    subtotal: 3200.00,
    taxAmount: 320.00,
    shippingCost: 100.00,
    totalAmount: 3620.00,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    poNumber: 'PO-2024-004',
    supplierId: '1',
    supplierName: 'TechSupply Co.',
    orderDate: '2024-01-18T10:00:00Z',
    deliveryDate: '2024-02-01T10:00:00Z',
    status: 'draft',
    paymentTerms: 'Net 30',
    notes: '',
    items: [],
    subtotal: 800.00,
    taxAmount: 80.00,
    shippingCost: 50.00,
    totalAmount: 930.00,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '5',
    poNumber: 'PO-2024-005',
    supplierId: '4',
    supplierName: 'Office Solutions Inc.',
    orderDate: '2024-01-19T10:00:00Z',
    deliveryDate: '2024-01-26T10:00:00Z',
    status: 'cancelled',
    paymentTerms: 'COD',
    notes: 'Cancelled due to budget constraints',
    items: [],
    subtotal: 450.00,
    taxAmount: 45.00,
    shippingCost: 25.00,
    totalAmount: 520.00,
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
];

export const purchasingService = {
  async getSuppliers(filters: SupplierFilters = {}): Promise<{ data: Supplier[]; total: number }> {
    await delay(500);
    let filtered = [...mockSuppliers];
    
    if (filters.name) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(filters.name!.toLowerCase()));
    }
    if (filters.city) {
      filtered = filtered.filter(s => s.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.rating) {
      filtered = filtered.filter(s => s.rating >= filters.rating!);
    }
    
    return { data: filtered, total: filtered.length };
  },

  async getSupplier(id: string): Promise<Supplier | null> {
    await delay(300);
    return mockSuppliers.find(s => s.id === id) || null;
  },

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    await delay(500);
    const newSupplier: Supplier = {
      id: String(Date.now()),
      ...data,
      rating: 0,
      totalOrders: 0,
      onTimeDelivery: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newSupplier;
  },

  async updateSupplier(id: string, data: Partial<CreateSupplierDto>): Promise<Supplier> {
    await delay(500);
    const supplier = mockSuppliers.find(s => s.id === id);
    if (!supplier) throw new Error('Supplier not found');
    return { ...supplier, ...data, updatedAt: new Date().toISOString() };
  },

  async deleteSupplier(_id: string): Promise<void> {
    await delay(300);
  },

  async getPurchaseOrders(filters: PurchaseOrderFilters = {}): Promise<{ data: PurchaseOrder[]; total: number }> {
    await delay(500);
    let filtered = [...mockOrders];
    
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }
    if (filters.supplierId) {
      filtered = filtered.filter(o => o.supplierId === filters.supplierId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(o => 
        o.poNumber.toLowerCase().includes(search) || 
        o.supplierName.toLowerCase().includes(search)
      );
    }
    
    return { data: filtered, total: filtered.length };
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    await delay(300);
    return mockOrders.find(o => o.id === id) || null;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    await delay(500);
    const supplier = mockSuppliers.find(s => s.id === data.supplierId);
    const newOrder: PurchaseOrder = {
      id: String(Date.now()),
      poNumber: `PO-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`,
      supplierId: data.supplierId,
      supplierName: supplier?.name || 'Unknown',
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      status: data.status,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      items: data.items,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      shippingCost: data.shippingCost,
      totalAmount: data.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newOrder;
  },

  async updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> {
    await delay(500);
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return { ...order, ...data, updatedAt: new Date().toISOString() };
  },

  async deletePurchaseOrder(_id: string): Promise<void> {
    await delay(300);
  },
};

export default purchasingService;
