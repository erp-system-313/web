import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Modal,
  Select,
  Table,
  Tag,
  Space,
  Input,
  InputNumber,
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSuppliers } from "../../hooks/useSuppliers";
import type { CreateSupplierDto } from "../../types/supplier.types";
import formStyles from "../../components/common/FormCard/FormCard.module.css";
import styles from "./SupplierListPage.module.css";

const supplierSchema = yup.object({
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

type SupplierFormData = yup.InferType<typeof supplierSchema>;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

const paymentTermsLabels: Record<number, string> = {
  30: "Net 30",
  60: "Net 60",
  90: "Net 90",
};

export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, loading, fetchSuppliers, createSupplier } = useSuppliers();

  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: yupResolver(supplierSchema),
    defaultValues: {
      code: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      paymentTerms: 30,
    },
  });

  const loadSuppliers = useCallback(async () => {
    await fetchSuppliers({}, 1);
  }, [fetchSuppliers]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const filteredSuppliers = useMemo(() => {
    let list = suppliers;
    if (statusFilter === "ACTIVE") {
      list = list.filter((s) => s.status === "ACTIVE");
    } else if (statusFilter === "INACTIVE") {
      list = list.filter((s) => s.status !== "ACTIVE");
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (s) =>
          (s.code || '').toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q),
      );
    }
    return list;
  }, [suppliers, statusFilter, searchText]);

  const handleViewSupplier = (id: number) => {
    navigate(`/purchasing/suppliers/${id}`);
  };

  const handleCreatePO = (supplierId: number) => {
    navigate(`/purchasing/orders/new?supplier=${supplierId}`);
  };

  const handleAddSupplier = () => {
    reset();
    setModalOpen(true);
  };

  const handleCreateSupplier = async (data: SupplierFormData) => {
    setSubmitting(true);
    try {
      await createSupplier(data as CreateSupplierDto);
      setModalOpen(false);
      loadSuppliers();
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const listColumns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: any) => (
        <Tag color={record.status === "ACTIVE" ? "green" : "red"}>{record.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}</Tag>
      ),
    },
    {
      title: "Payment Terms",
      dataIndex: "paymentTerms",
      key: "paymentTerms",
      render: (terms: number) => paymentTermsLabels[terms] || `Net ${terms}`,
    },
    {
      title: "Total Purchased",
      dataIndex: "totalPurchased",
      key: "totalPurchased",
      render: (amount: number) => `$${(amount ?? 0).toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: any) => (
        <Space className={styles.tableActions}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSupplier(record.id)}
          />
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleCreatePO(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Suppliers</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddSupplier}
        >
          Add Supplier
        </Button>
      </div>

      <Card className={styles.filterBar}>
        <Space size="large" wrap>
          <Input.Search
            placeholder="Search suppliers..."
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={setSearchText}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            options={statusOptions}
            onChange={setStatusFilter}
          />
        </Space>
      </Card>

      <Table
        columns={listColumns}
        dataSource={filteredSuppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} suppliers`,
        }}
      />

      <Modal
        title="Add Supplier"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit(handleCreateSupplier)}
        confirmLoading={submitting}
        okText="Create Supplier"
      >
        <form onSubmit={handleSubmit(handleCreateSupplier)}>
          <div className={formStyles.formItem}>
            <label>Supplier Code *</label>
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
              <span className={formStyles.error}>{errors.code.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Supplier Name *</label>
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
              <span className={formStyles.error}>{errors.name.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Contact Person *</label>
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
              <span className={formStyles.error}>
                {errors.contactPerson.message}
              </span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Email *</label>
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
              <span className={formStyles.error}>{errors.email.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Phone *</label>
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
              <span className={formStyles.error}>{errors.phone.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Address *</label>
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
              <span className={formStyles.error}>{errors.address.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Tax ID *</label>
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
              <span className={formStyles.error}>{errors.taxId.message}</span>
            )}
          </div>
          <div className={formStyles.formItem}>
            <label>Payment Terms (days) *</label>
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
              <span className={formStyles.error}>
                {errors.paymentTerms.message}
              </span>
            )}
          </div>
        </form>
      </Modal>

      {filteredSuppliers.length === 0 && !loading && (
        <div className={styles.emptyState}>
          {searchText || statusFilter
            ? "No suppliers match your filters."
            : 'No suppliers found. Click "Add Supplier" to create one.'}
        </div>
      )}
    </div>
  );
};

export default SupplierListPage;
