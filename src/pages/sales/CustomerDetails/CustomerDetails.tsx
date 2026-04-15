import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Descriptions, Table, Space, Typography } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { StatusBadge, TabPanel } from "../../../components/common";
import { useCustomer } from "../../../hooks";
import type { CustomerContact, SalesOrder } from "../../../types/sales";
import styles from "./CustomerDetails.module.css";

const { Title } = Typography;

export const CustomerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || "0", 10);

  const {
    data: customer,
    contacts,
    salesHistory,
    loading,
    error,
  } = useCustomer(customerId);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (error || !customer) {
    return <div className={styles.container}>Customer not found</div>;
  }

  const contactColumns: ColumnsType<CustomerContact> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" />
          <Button type="text" danger size="small">
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const orderColumns: ColumnsType<SalesOrder> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: SalesOrder) => (
        <Button
          type="link"
          onClick={() => navigate(`/sales/orders/${record.id}/edit`)}
        >
          View Order
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      label: "General Info",
      key: "general",
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Customer Name">
            {customer.name}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={customer.isActive} />
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {customer.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {customer.phone || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {customer.address || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Credit Limit">
            ${customer.creditLimit.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Terms">
            {customer.paymentTerms.replace("_", " ")}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      label: `Contacts (${contacts.length})`,
      key: "contacts",
      children: (
        <div>
          <div className={styles.sectionHeader}>
            <Button type="primary">Add Contact</Button>
          </div>
          <Table
            dataSource={contacts}
            columns={contactColumns}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
    {
      label: `Sales History (${salesHistory.length})`,
      key: "orders",
      children: (
        <Table
          dataSource={salesHistory}
          columns={orderColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sales/customers")}
        >
          Back
        </Button>
        <Title level={3} style={{ margin: 0, flex: 1 }}>
          {customer.name}
        </Title>
        <Button type="primary" icon={<EditOutlined />}>
          Edit Customer
        </Button>
      </div>

      <Card className={styles.card}>
        <TabPanel items={tabItems} />
      </Card>
    </div>
  );
};

export default CustomerDetails;
