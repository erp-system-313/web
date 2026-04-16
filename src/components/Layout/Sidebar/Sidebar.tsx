import { useContext } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  InboxOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from "./Sidebar.module.css";

type MenuItem = Required<MenuProps>["items"][number];

export const Sidebar: React.FC<{ collapsed?: boolean }> = ({
  collapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);

  const user = authContext?.user;
  const logout = authContext?.logout;

  const userRole = (user?.role || "STAFF").toLowerCase();

  const isVisible = (roles?: string[]): boolean => {
    if (!roles) return true;
    return roles.some((role) => role.toLowerCase() === userRole);
  };

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "inventory",
      icon: <InboxOutlined />,
      label: "Inventory",
      children: [
        {
          key: "products",
          label: "Products",
          onClick: () => navigate("/inventory/products"),
        },
        {
          key: "categories",
          label: "Categories",
          onClick: () => navigate("/inventory/categories"),
        },
      ],
    },
    {
      key: "sales",
      icon: <DollarOutlined />,
      label: "Sales",
      children: [
        {
          key: "sales-orders",
          label: "Orders",
          onClick: () => navigate("/sales/orders"),
        },
        {
          key: "customers",
          label: "Customers",
          onClick: () => navigate("/sales/customers"),
        },
      ],
    },
    {
      key: "purchasing",
      icon: <ShoppingCartOutlined />,
      label: "Purchasing",
      children: [
        {
          key: "suppliers",
          label: "Suppliers",
          onClick: () => navigate("/purchasing/suppliers"),
        },
        {
          key: "purchase-orders",
          label: "Orders",
          onClick: () => navigate("/purchasing/orders"),
        },
      ],
    },
    {
      key: "finance",
      icon: <FileTextOutlined />,
      label: "Finance",
      children: [
        {
          key: "invoices",
          label: "Invoices",
          onClick: () => navigate("/finance/invoices"),
        },
        {
          key: "journal",
          label: "Journal",
          onClick: () => navigate("/finance/journal"),
        },
        {
          key: "accounts",
          label: "Accounts",
          onClick: () => navigate("/finance/accounts"),
        },
      ],
    },
    {
      key: "hr",
      icon: <TeamOutlined />,
      label: "HR",
      children: [
        {
          key: "employees",
          label: "Employees",
          onClick: () => navigate("/hr/employees"),
        },
        {
          key: "attendance",
          label: "Attendance",
          onClick: () => navigate("/hr/attendance"),
        },
        {
          key: "leave",
          label: "Leave",
          onClick: () => navigate("/hr/leave"),
        },
      ],
    },
    {
      key: "admin",
      icon: <SettingOutlined />,
      label: "Admin",
      children: [
        {
          key: "users",
          label: "Users",
          onClick: () => navigate("/admin/users"),
        },
        {
          key: "settings",
          label: "Settings",
          onClick: () => navigate("/admin/settings"),
        },
        {
          key: "audit-logs",
          label: "Audit Logs",
          onClick: () => navigate("/admin/audit-logs"),
        },
      ],
    },
  ].filter((item) => {
    if (!item) return false;
    const key = item.key as string;
    if (key === "inventory" && !isVisible(["admin", "manager"])) return false;
    if (key === "admin" && !isVisible(["admin"])) return false;
    return true;
  });

  const getSelectedKey = (): string => {
    const path = location.pathname;

    if (path.startsWith("/inventory/products")) return "products";
    if (path.startsWith("/inventory/categories")) return "categories";
    if (path.startsWith("/sales/orders")) return "sales-orders";
    if (path.startsWith("/sales/customers")) return "customers";
    if (path.startsWith("/purchasing/suppliers")) return "suppliers";
    if (path.startsWith("/purchasing/orders")) return "purchase-orders";
    if (path.startsWith("/finance/invoices")) return "invoices";
    if (path.startsWith("/finance/journal")) return "journal";
    if (path.startsWith("/finance/accounts")) return "accounts";
    if (path.startsWith("/hr/employees")) return "employees";
    if (path.startsWith("/hr/attendance")) return "attendance";
    if (path.startsWith("/hr/leave")) return "leave";
    if (path.startsWith("/admin/users")) return "users";
    if (path.startsWith("/admin/settings")) return "settings";
    if (path.startsWith("/admin/audit-logs")) return "audit-logs";
    if (path === "/dashboard") return "dashboard";
    return "";
  };

  const getOpenKeys = (): string[] => {
    const selectedKey = getSelectedKey();

    const parentMap: Record<string, string> = {
      products: "inventory",
      categories: "inventory",
      "sales-orders": "sales",
      customers: "sales",
      suppliers: "purchasing",
      "purchase-orders": "purchasing",
      invoices: "finance",
      journal: "finance",
      accounts: "finance",
      employees: "hr",
      attendance: "hr",
      leave: "hr",
      users: "admin",
      settings: "admin",
      "audit-logs": "admin",
    };

    const parentKey = parentMap[selectedKey];
    return parentKey ? [parentKey] : [];
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.logo} />
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className={styles.menu}
        inlineCollapsed={collapsed}
      />
      <div className={styles.footer}>
        <div
          className={styles.logoutButton}
          onClick={() => logout?.()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && logout?.()}
        >
          <LogoutOutlined />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
