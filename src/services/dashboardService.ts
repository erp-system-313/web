import api, { handleApiError } from './apiClient';

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  pendingOrders: number;
  pendingInvoices: number;
  lowStockProducts: number;
  totalEmployees: number;
  salesTrend: Array<{ date: string; amount: number }>;
  topProducts: Array<{ productId: number; productName: string; quantitySold: number }>;
  recentOrders: Array<{ orderId: number; orderNumber: string; customerName: string; totalAmount: number; status: string; orderDate: string }>;
}

interface BackendStats {
  totalSales: number;
  totalPurchases: number;
  pendingOrders: number;
  pendingInvoices: number;
  lowStockProducts: number;
  totalEmployees: number;
  salesTrend: Array<{ date: string; amount: number }>;
  topProducts: Array<{ productId: number; productName: string; quantitySold: number }>;
  recentOrders: Array<{ orderId: number; orderNumber: string; customerName: string; totalAmount: number; status: string; orderDate: string }>;
}

const mapBackendToFrontend = (backend: BackendStats | null | undefined): DashboardStats => {
  if (!backend) {
    return {
      totalSales: 0,
      totalPurchases: 0,
      pendingOrders: 0,
      pendingInvoices: 0,
      lowStockProducts: 0,
      totalEmployees: 0,
      salesTrend: [],
      topProducts: [],
      recentOrders: [],
    };
  }
  return {
    totalSales: Number(backend.totalSales) || 0,
    totalPurchases: Number(backend.totalPurchases) || 0,
    pendingOrders: backend.pendingOrders || 0,
    pendingInvoices: backend.pendingInvoices || 0,
    lowStockProducts: backend.lowStockProducts || 0,
    totalEmployees: backend.totalEmployees || 0,
    salesTrend: backend.salesTrend || [],
    topProducts: backend.topProducts || [],
    recentOrders: backend.recentOrders || [],
  };
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/dashboard/stats');
      return mapBackendToFrontend(response.data?.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default dashboardService;