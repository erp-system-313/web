import api from './apiClient';

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  pendingOrders: number;
  pendingInvoices: number;
  lowStockProducts: number;
  totalEmployees: number;
  salesTrend: Array<{ month: string; amount: number }>;
  topProducts: Array<{ id: number; name: string; sales: number }>;
  recentOrders: Array<{ id: number; customer: string; total: number; status: string; date: string }>;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },
};

export default dashboardService;