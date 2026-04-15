import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    borderRadius: 6,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Table: {
      headerBg: "#fafafa",
      headerColor: "#262626",
      rowHoverBg: "#f5f5f5",
    },
    Button: {
      primaryShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
    },
  },
};
