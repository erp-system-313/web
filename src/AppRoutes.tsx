import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext || authContext.isLoading) {
    return <div>Loading...</div>;
  }

  if (!authContext.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* HR routes */}
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute>
            <EmployeesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leave"
        element={
          <ProtectedRoute>
            <LeaveRequestsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UsersListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Finance routes */}
      <Route
        path="/finance/invoices"
        element={
          <ProtectedRoute>
            <InvoicesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/invoices/new"
        element={
          <ProtectedRoute>
            <InvoiceForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/invoices/:id/edit"
        element={
          <ProtectedRoute>
            <InvoiceForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/journal"
        element={
          <ProtectedRoute>
            <JournalEntries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/journal/new"
        element={
          <ProtectedRoute>
            <JournalEntryForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/accounts"
        element={
          <ProtectedRoute>
            <ChartOfAccounts />
          </ProtectedRoute>
        }
      />

      {/* Sales routes */}
      <Route
        path="/sales/orders"
        element={
          <ProtectedRoute>
            <SalesOrdersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders/new"
        element={
          <ProtectedRoute>
            <SalesOrderForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders/:id"
        element={
          <ProtectedRoute>
            <SalesOrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/orders/:id/edit"
        element={
          <ProtectedRoute>
            <SalesOrderForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers"
        element={
          <ProtectedRoute>
            <CustomersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetails />
          </ProtectedRoute>
        }
      />

      {/* Inventory routes */}
      <Route
        path="/inventory/products"
        element={
          <ProtectedRoute>
            <ProductListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products/new"
        element={
          <ProtectedRoute>
            <CreateProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products/:id/edit"
        element={
          <ProtectedRoute>
            <EditProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/categories"
        element={
          <ProtectedRoute>
            <CategoryListPage />
          </ProtectedRoute>
        }
      />

      {/* Purchasing routes */}
      <Route
        path="/purchasing/suppliers"
        element={
          <ProtectedRoute>
            <SupplierListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/suppliers/new"
        element={
          <ProtectedRoute>
            <SupplierListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/suppliers/:id"
        element={
          <ProtectedRoute>
            <SupplierDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/suppliers/:id/edit"
        element={
          <ProtectedRoute>
            <SupplierDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders"
        element={
          <ProtectedRoute>
            <PurchaseOrderListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders/new"
        element={
          <ProtectedRoute>
            <CreatePurchaseOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders/:id"
        element={
          <ProtectedRoute>
            <PurchaseOrderListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchasing/orders/:id/edit"
        element={
          <ProtectedRoute>
            <PurchaseOrderListPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
