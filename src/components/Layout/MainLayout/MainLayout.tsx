import { useState, useEffect, useContext } from "react";
import { Layout, Button, Dropdown, Avatar, theme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import { Sidebar } from "../Sidebar";
import styles from "./MainLayout.module.css";

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const { user, isAuthenticated, logout } = authContext || {};

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobile(isMobile);
      if (isMobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !authContext?.isLoading) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authContext?.isLoading, navigate]);

  if (authContext?.isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout?.();
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const siderWidth = collapsed ? 80 : 256;

  return (
    <Layout className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={256}
        collapsedWidth={80}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout className={styles.layoutContent} style={{ marginLeft: siderWidth }}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className={styles.trigger}
            />
          </div>
          <div className={styles.headerRight}>
            <Button
              type="text"
              icon={<BellOutlined />}
              className={styles.notificationButton}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userDropdown}>
                <Avatar
                  icon={<UserOutlined />}
                  className={styles.avatar}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userRole}>{user?.role}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;