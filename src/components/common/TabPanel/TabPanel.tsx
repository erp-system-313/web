import React, { useState } from "react";
import { Tabs } from "antd";
import type { TabPaneProps } from "antd";
import styles from "./TabPanel.module.css";

interface TabItem extends Omit<TabPaneProps, "tab"> {
  label: string;
  key: string;
}

interface TabPanelProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  items,
  defaultActiveKey,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveKey || items[0]?.key);

  const handleChange = (key: string) => {
    setActiveTab(key);
    onChange?.(key);
  };

  return (
    <div className={styles.container}>
      <Tabs
        activeKey={activeTab}
        onChange={handleChange}
        items={items.map((item) => ({
          ...item,
          children: item.children,
        }))}
      />
    </div>
  );
};

export default TabPanel;
