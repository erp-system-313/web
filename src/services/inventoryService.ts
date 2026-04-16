import type { Product, CreateProductDto, ProductFilters } from '../types/product.types';
import type { Category, CreateCategoryDto } from '../types/category.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    description: 'Ergonomic wireless mouse with USB receiver',
    categoryId: 'electronics',
    categoryName: 'Electronics',
    unitPrice: 29.99,
    costPrice: 15.00,
    stockQuantity: 150,
    reorderPoint: 20,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'USB-C Cable',
    sku: 'USB-C-01',
    description: 'High-speed USB-C charging cable 6ft',
    categoryId: 'electronics',
    categoryName: 'Electronics',
    unitPrice: 12.99,
    costPrice: 5.00,
    stockQuantity: 8,
    reorderPoint: 15,
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Notebook A5',
    sku: 'NB-A5-01',
    description: 'Lined notebook with 200 pages',
    categoryId: 'office',
    categoryName: 'Office Supplies',
    unitPrice: 8.99,
    costPrice: 3.00,
    stockQuantity: 0,
    reorderPoint: 25,
    isActive: true,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', parentId: null, productCount: 45, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Office Supplies', description: 'Stationery and office equipment', parentId: null, productCount: 120, createdAt: '2024-01-16T10:00:00Z', updatedAt: '2024-01-16T10:00:00Z' },
  { id: '3', name: 'Computers', description: 'Laptops and desktops', parentId: '1', productCount: 25, createdAt: '2024-01-17T10:00:00Z', updatedAt: '2024-01-17T10:00:00Z' },
  { id: '4', name: 'Accessories', description: 'Electronic accessories', parentId: '1', productCount: 20, createdAt: '2024-01-18T10:00:00Z', updatedAt: '2024-01-18T10:00:00Z' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const inventoryService = {
  async getProducts(filters: ProductFilters = {}): Promise<{ data: Product[]; total: number }> {
    await delay(500);
    let filtered = [...mockProducts];
    
    if (filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
    }
    if (filters.stockStatus) {
      filtered = filtered.filter(p => {
        if (filters.stockStatus === 'out_of_stock') return p.stockQuantity === 0;
        if (filters.stockStatus === 'low_stock') return p.stockQuantity > 0 && p.stockQuantity <= p.reorderPoint;
        return p.stockQuantity > p.reorderPoint;
      });
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.unitPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.unitPrice <= filters.maxPrice!);
    }
    
    return { data: filtered, total: filtered.length };
  },

  async getProduct(id: string): Promise<Product | null> {
    await delay(300);
    return mockProducts.find(p => p.id === id) || null;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      id: String(Date.now()),
      ...data,
      categoryName: 'General',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
    await delay(500);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return { ...product, ...data, updatedAt: new Date().toISOString() };
  },

  async deleteProduct(_id: string): Promise<void> {
    await delay(300);
  },

  async getCategories(): Promise<Category[]> {
    await delay(500);
    return mockCategories;
  },

  async getCategory(id: string): Promise<Category | null> {
    await delay(300);
    return mockCategories.find(c => c.id === id) || null;
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    await delay(500);
    const newCategory: Category = {
      id: String(Date.now()),
      ...data,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newCategory;
  },

  async updateCategory(id: string, data: CreateCategoryDto): Promise<Category> {
    await delay(500);
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    return { ...category, ...data, updatedAt: new Date().toISOString() };
  },

  async deleteCategory(_id: string): Promise<void> {
    await delay(300);
  },
};

export default inventoryService;
