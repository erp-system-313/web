import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Profile = lazy(() => import("@/pages/profile/Profile"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const Employees = lazy(() => import("@/pages/hr/Employees"));
const EmployeeDetails = lazy(() => import("@/pages/hr/EmployeeDetails"));
const Attendance = lazy(() => import("@/pages/hr/Attendance"));
const LeaveRequests = lazy(() => import("@/pages/hr/LeaveRequests"));
const Products = lazy(() => import("@/pages/inventory/Products"));
const AddProduct = lazy(() => import("@/pages/inventory/AddProduct"));
const Categories = lazy(() => import("@/pages/inventory/Categories"));
const Suppliers = lazy(() => import("@/pages/purchasing/Suppliers"));
const SupplierDetails = lazy(
  () => import("@/pages/purchasing/SupplierDetails"),
);
const PurchaseOrders = lazy(() => import("@/pages/purchasing/PurchaseOrders"));
const NewPurchaseOrder = lazy(
  () => import("@/pages/purchasing/NewPurchaseOrder"),
);
const Customers = lazy(() => import("@/pages/sales/Customers"));
const CustomerDetails = lazy(() => import("@/pages/sales/CustomerDetails"));
const SalesOrders = lazy(() => import("@/pages/sales/SalesOrders"));
const NewSalesOrder = lazy(() => import("@/pages/sales/NewSalesOrder"));
const Invoices = lazy(() => import("@/pages/finance/Invoices"));
const NewInvoice = lazy(() => import("@/pages/finance/NewInvoice"));
const InvoiceDetails = lazy(() => import("@/pages/finance/InvoiceDetails"));
const Accounts = lazy(() => import("@/pages/finance/Accounts"));
const Journal = lazy(() => import("@/pages/finance/Journal"));

function PageLoader() {
  return <div>Loading...</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Suspense fallback={<PageLoader />}>
                <Users />
              </Suspense>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <Suspense fallback={<PageLoader />}>
                <AuditLogs />
              </Suspense>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <Suspense fallback={<PageLoader />}>
                <Employees />
              </Suspense>
            }
          />
          <Route
            path="/hr/employees/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <EmployeeDetails />
              </Suspense>
            }
          />
          <Route
            path="/hr/attendance"
            element={
              <Suspense fallback={<PageLoader />}>
                <Attendance />
              </Suspense>
            }
          />
          <Route
            path="/hr/leave"
            element={
              <Suspense fallback={<PageLoader />}>
                <LeaveRequests />
              </Suspense>
            }
          />
          <Route
            path="/inventory/products"
            element={
              <Suspense fallback={<PageLoader />}>
                <Products />
              </Suspense>
            }
          />
          <Route
            path="/inventory/products/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <AddProduct />
              </Suspense>
            }
          />
          <Route
            path="/inventory/categories"
            element={
              <Suspense fallback={<PageLoader />}>
                <Categories />
              </Suspense>
            }
          />
          <Route
            path="/purchasing/suppliers"
            element={
              <Suspense fallback={<PageLoader />}>
                <Suppliers />
              </Suspense>
            }
          />
          <Route
            path="/purchasing/suppliers/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <SupplierDetails />
              </Suspense>
            }
          />
          <Route
            path="/purchasing/orders"
            element={
              <Suspense fallback={<PageLoader />}>
                <PurchaseOrders />
              </Suspense>
            }
          />
          <Route
            path="/purchasing/orders/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <NewPurchaseOrder />
              </Suspense>
            }
          />
          <Route
            path="/sales/customers"
            element={
              <Suspense fallback={<PageLoader />}>
                <Customers />
              </Suspense>
            }
          />
          <Route
            path="/sales/customers/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <CustomerDetails />
              </Suspense>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <Suspense fallback={<PageLoader />}>
                <SalesOrders />
              </Suspense>
            }
          />
          <Route
            path="/sales/orders/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <NewSalesOrder />
              </Suspense>
            }
          />
          <Route
            path="/finance/invoices"
            element={
              <Suspense fallback={<PageLoader />}>
                <Invoices />
              </Suspense>
            }
          />
          <Route
            path="/finance/invoices/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <NewInvoice />
              </Suspense>
            }
          />
          <Route
            path="/finance/invoices/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <InvoiceDetails />
              </Suspense>
            }
          />
          <Route
            path="/finance/accounts"
            element={
              <Suspense fallback={<PageLoader />}>
                <Accounts />
              </Suspense>
            }
          />
          <Route
            path="/finance/journal"
            element={
              <Suspense fallback={<PageLoader />}>
                <Journal />
              </Suspense>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
