import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./components/Layout";
import { EmployeesList } from "./pages/hr/EmployeesList/EmployeesList";
import { EmployeeDetails } from "./pages/hr/EmployeeDetails/EmployeeDetails";
import AttendancePage from "./pages/hr/Attendance/Attendance";
import LeaveRequestsPage from "./pages/hr/LeaveRequests/LeaveRequests";
import LoginPage from "./pages/auth/Login/Login";
import DashboardPage from "./pages/common/Dashboard/Dashboard";
import ProfilePage from "./pages/common/Profile/Profile";
import UsersListPage from "./pages/admin/Users/Users";
import SettingsPage from "./pages/admin/Settings/Settings";
import AuditLogsPage from "./pages/admin/AuditLogs/AuditLogs";
import {
  InvoicesList,
  InvoiceForm,
  InvoiceDetails,
  JournalEntries,
  JournalEntryForm,
  ChartOfAccounts,
} from "./pages/finance";
import {
  SalesOrdersList,
  SalesOrderForm,
  SalesOrderDetails,
  CustomersList,
  CustomerDetails,
} from "./pages/sales";
import ProductListPage from "./pages/inventory/ProductListPage";
import ProductDetailsPage from "./pages/inventory/ProductDetailsPage";
import EditProductPage from "./pages/inventory/EditProductPage";
import CategoryListPage from "./pages/inventory/CategoryListPage";
import CreateProductPage from "./pages/inventory/CreateProductPage";
import SupplierListPage from "./pages/purchasing/SupplierListPage";
import SupplierDetailsPage from "./pages/purchasing/SupplierDetailsPage";
import PurchaseOrderListPage from "./pages/purchasing/PurchaseOrderListPage";
import CreatePurchaseOrderPage from "./pages/purchasing/CreatePurchaseOrderPage";

const ProtectedLayout = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* HR routes */}
        <Route path="/hr/employees" element={<EmployeesList />} />
        <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
        <Route path="/hr/attendance" element={<AttendancePage />} />
        <Route path="/hr/leave" element={<LeaveRequestsPage />} />

        {/* Admin routes */}
        <Route path="/admin/users" element={<UsersListPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />

        {/* Finance routes */}
        <Route path="/finance/invoices" element={<InvoicesList />} />
        <Route path="/finance/invoices/new" element={<InvoiceForm />} />
        <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
        <Route path="/finance/invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="/finance/journal" element={<JournalEntries />} />
        <Route path="/finance/journal/new" element={<JournalEntryForm />} />
        <Route path="/finance/accounts" element={<ChartOfAccounts />} />

        {/* Sales routes */}
        <Route path="/sales/orders" element={<SalesOrdersList />} />
        <Route path="/sales/orders/new" element={<SalesOrderForm />} />
        <Route path="/sales/orders/:id" element={<SalesOrderDetails />} />
        <Route path="/sales/orders/:id/edit" element={<SalesOrderForm />} />
        <Route path="/sales/customers" element={<CustomersList />} />
        <Route path="/sales/customers/:id" element={<CustomerDetails />} />

        {/* Inventory routes */}
        <Route path="/inventory/products" element={<ProductListPage />} />
        <Route path="/inventory/products/new" element={<CreateProductPage />} />
        <Route path="/inventory/products/:id" element={<ProductDetailsPage />} />
        <Route path="/inventory/products/:id/edit" element={<EditProductPage />} />
        <Route path="/inventory/categories" element={<CategoryListPage />} />

        {/* Purchasing routes */}
        <Route path="/purchasing/suppliers" element={<SupplierListPage />} />
        <Route path="/purchasing/suppliers/new" element={<SupplierListPage />} />
        <Route path="/purchasing/suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="/purchasing/suppliers/:id/edit" element={<SupplierDetailsPage />} />
        <Route path="/purchasing/orders" element={<PurchaseOrderListPage />} />
        <Route path="/purchasing/orders/new" element={<CreatePurchaseOrderPage />} />
        <Route path="/purchasing/orders/:id" element={<PurchaseOrderListPage />} />
        <Route path="/purchasing/orders/:id/edit" element={<PurchaseOrderListPage />} />
      </Route>

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;