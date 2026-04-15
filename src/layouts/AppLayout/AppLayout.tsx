import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./AppLayout.module.css";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const salesMenuItems = [
    {
      key: "/sales/orders",
      icon: <ShoppingCartOutlined />,
      label: "Sales Orders",
      onClick: () => navigate("/sales/orders"),
    },
    {
      key: "/sales/customers",
      icon: <UserOutlined />,
      label: "Customers",
      onClick: () => navigate("/sales/customers"),
    },
  ];

  const currentKey =
    salesMenuItems.find((item) => location.pathname.startsWith(item.key))
      ?.key || "";

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>ERP System</div>
      </Header>
      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[currentKey]}
            items={salesMenuItems}
            className={styles.menu}
          />
        </Sider>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
