import api, { handleApiError } from './apiClient';

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
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default dashboardService;