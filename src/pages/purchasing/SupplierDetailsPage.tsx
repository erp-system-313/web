import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tabs,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Input,
  InputNumber,
  message,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { PurchaseOrderStatus } from "../../types/purchaseOrder.types";
import type { CreateSupplierDto } from "../../types/supplier.types";
import { useSuppliers } from "../../hooks/useSuppliers";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";
import styles from "./SupplierDetailsPage.module.css";

const editSchema = yup.object({
  code: yup.string().required("Supplier code is required"),
  name: yup.string().required("Supplier name is required"),
  contactPerson: yup.string().required("Contact person is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  address: yup.string().required("Address is required"),
  taxId: yup.string().required("Tax ID is required"),
  paymentTerms: yup
    .number()
    .required("Payment terms is required")
    .min(1, "Must be at least 1"),
});

type EditFormData = yup.InferType<typeof editSchema>;

const getStatusTag = (status: PurchaseOrderStatus) => {
  const colors: Record<string, string> = {
    DRAFT: "default",
    SENT: "processing",
    RECEIVED: "green",
    PARTIAL: "blue",
    CANCELLED: "red",
    PENDING: "orange",
    APPROVED: "green",
  };
  return <Tag color={colors[status] ?? "default"}>{status}</Tag>;
};

export const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const userRole = (authContext?.user?.role || "STAFF").toLowerCase();
  const isAdminOrManager = userRole === "admin" || userRole === "manager";
  const {
    suppliers,
    loading: supplierLoading,
    fetchSuppliers,
    deleteSupplier,
    updateSupplier,
  } = useSuppliers();
  const { orders, loading: ordersLoading, fetchOrders } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState("purchaseOrders");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: yupResolver(editSchema),
  });

  const supplier = suppliers.find((s) => s.id === Number(id));

  const loadData = useCallback(async () => {
    if (id) {
      await fetchSuppliers({}, 1);
      await fetchOrders({ supplierId: Number(id) }, 1);
    }
  }, [id, fetchSuppliers, fetchOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (supplierLoading) {
    return <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>;
  }

  if (!supplier) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>Supplier not found</div>
    );
  }

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Supplier",
      content: "Are you sure you want to delete this supplier?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        await deleteSupplier(supplier.id);
        navigate("/purchasing/suppliers");
      },
    });
  };

  const handleCreatePO = () => {
    navigate(`/purchasing/orders/new?supplier=${id}`);
  };

  const handleBack = () => {
    navigate("/purchasing/suppliers");
  };

  const handleEditSupplier = async (data: EditFormData) => {
    setEditSubmitting(true);
    try {
      await updateSupplier(supplier.id, data as Partial<CreateSupplierDto>);
      setEditModalOpen(false);
    } catch {
      // error handled by hook
    } finally {
      setEditSubmitting(false);
    }
  };

  const orderColumns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
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
      render: (status: PurchaseOrderStatus) => getStatusTag(status),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${(amount ?? 0).toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => (
        <Button
          type="text"
          onClick={() => navigate(`/purchasing/orders/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "purchaseOrders",
      label: "Purchase Orders",
      children: (
        <div className={styles.tabContent}>
          <Table
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            loading={ordersLoading}
          />
        </div>
      ),
    },
    {
      key: "analytics",
      label: "Analytics",
      children: (
        <div className={styles.tabContent}>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Purchasing Volume">
                <Statistic
                  value={supplier.totalPurchased}
                  prefix="$"
                  precision={2}
                />
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <span style={{ color: "#999" }}>Total Purchased</span>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Status">
                <Tag
                  color={supplier.isActive ? "green" : "red"}
                  style={{ fontSize: 16, padding: "4px 12px" }}
                >
                  {supplier.isActive ? "ACTIVE" : "INACTIVE"}
                </Tag>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <span style={{ color: "#999" }}>Current Status</span>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <div>
          <div className={styles.backLink} onClick={handleBack}>
            <ArrowLeftOutlined /> Back to Suppliers
          </div>
          <h1 className={styles.title}>{supplier.name}</h1>
        </div>
        <Space className={styles.headerActions}>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              reset({
                code: supplier.code,
                name: supplier.name,
                contactPerson: supplier.contactPerson,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                taxId: supplier.taxId,
                paymentTerms: supplier.paymentTerms,
              });
              setEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          {isAdminOrManager && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          )}
          {isAdminOrManager && (
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleCreatePO}
            >
              Create Purchase Order
            </Button>
          )}
        </Space>
      </div>

      <div className={styles.infoGrid}>
        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Contact Information</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Contact:</span>{" "}
            {supplier.contactPerson}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span> {supplier.email}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone:</span> {supplier.phone}
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Details</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Code:</span> {supplier.code}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tax ID:</span> {supplier.taxId}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Address:</span>{" "}
            {supplier.address}
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <div className={styles.infoCardTitle}>Payment & Status</div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Payment Terms:</span> Net{" "}
            {supplier.paymentTerms}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status:</span>{" "}
            <Tag color={supplier.isActive ? "green" : "red"}>
              {supplier.isActive ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total Purchased:</span> $
            {(supplier.totalPurchased ?? 0).toFixed(2)}
          </div>
        </Card>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal
        title="Edit Supplier"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSubmit(handleEditSupplier)}
        confirmLoading={editSubmitting}
        okText="Update Supplier"
      >
        <form onSubmit={handleSubmit(handleEditSupplier)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Supplier Code *
            </label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g. SUP-001"
                  status={errors.code ? "error" : undefined}
                />
              )}
            />
            {errors.code && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.code.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Supplier Name *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter supplier name"
                  status={errors.name ? "error" : undefined}
                />
              )}
            />
            {errors.name && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.name.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Contact Person *
            </label>
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Full name"
                  status={errors.contactPerson ? "error" : undefined}
                />
              )}
            />
            {errors.contactPerson && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.contactPerson.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Email *</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="email@example.com"
                  status={errors.email ? "error" : undefined}
                />
              )}
            />
            {errors.email && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.email.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Phone *</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Phone number"
                  status={errors.phone ? "error" : undefined}
                />
              )}
            />
            {errors.phone && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.phone.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Address *
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={2}
                  placeholder="Full address"
                  status={errors.address ? "error" : undefined}
                />
              )}
            />
            {errors.address && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.address.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Tax ID *
            </label>
            <Controller
              name="taxId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Tax identification number"
                  status={errors.taxId ? "error" : undefined}
                />
              )}
            />
            {errors.taxId && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.taxId.message}
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Payment Terms (days) *
            </label>
            <Controller
              name="paymentTerms"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  onChange={(value) => field.onChange(value ?? 30)}
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="30"
                  status={errors.paymentTerms ? "error" : undefined}
                />
              )}
            />
            {errors.paymentTerms && (
              <span style={{ color: "#ff4d4f", fontSize: 12 }}>
                {errors.paymentTerms.message}
              </span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierDetailsPage;
