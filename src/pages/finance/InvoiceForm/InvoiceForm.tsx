import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Table,
  Input,
  Select,
  message,
  Row,
  Col,
  Form,
  InputNumber,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { StatusBadge } from "../../../components/common";
import { useInvoice } from "../../../hooks";
import { invoiceFormSchema } from "../../../schemas/finance";
import styles from "./InvoiceForm.module.css";

const CUSTOMER_OPTIONS = [
  { value: 1, label: "Acme Corp" },
  { value: 2, label: "Tech Solutions" },
  { value: 3, label: "Global Industries" },
];

const PRODUCT_OPTIONS = [
  { value: 1, label: "Product A" },
  { value: 2, label: "Product B" },
  { value: 3, label: "Product C" },
];

interface LineItemData {
  id: string;
  productId?: number;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

interface InvoiceFormData {
  customerId: number;
  invoiceDate: string;
  dueDate: string;
  lines: LineItemData[];
}

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const invoiceId = isEditMode ? parseInt(id || "0", 10) : undefined;

  const {
    data: existingInvoice,
    loading,
    saving,
    create,
    update,
  } = useInvoice(invoiceId);

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: yupResolver(invoiceFormSchema) as any,
    defaultValues: {
      customerId: 0,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      lines: [
        {
          id: "1",
          productId: undefined,
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");

  const handleSave = (status: "DRAFT" | "SENT") => {
    const data = watch();
    const invoiceData = {
      customerId: data.customerId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      status,
      lines: data.lines
        .filter((l) => l.productId)
        .map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate || 0.1,
        })),
    };

    if (isEditMode) {
      update(invoiceData).then(() => {
        message.success(
          `Invoice ${status === "DRAFT" ? "saved as draft" : "created and sent"}`,
        );
        navigate("/finance/invoices");
      });
    } else {
      create(invoiceData).then(() => {
        message.success(
          `Invoice ${status === "DRAFT" ? "saved as draft" : "created and sent"}`,
        );
        navigate("/finance/invoices");
      });
    }
  };

  if (isEditMode && loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/finance/invoices")}
        >
          Back
        </Button>
        <h1>{isEditMode ? "Edit Invoice" : "New Invoice"}</h1>
        {existingInvoice && <StatusBadge status={existingInvoice.status} />}
      </div>

      <Form layout="vertical">
        <Card title="Invoice Details" className={styles.card}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Customer"
                help={errors.customerId?.message}
                validateStatus={errors.customerId ? "error" : ""}
              >
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select customer..."
                      options={CUSTOMER_OPTIONS}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Invoice Date"
                help={errors.invoiceDate?.message}
                validateStatus={errors.invoiceDate ? "error" : ""}
              >
                <Input type="date" {...register("invoiceDate")} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Due Date"
                help={errors.dueDate?.message}
                validateStatus={errors.dueDate ? "error" : ""}
              >
                <Input type="date" {...register("dueDate")} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Line Items" className={styles.card}>
          <Table
            dataSource={fields.map((field) => ({
              ...field,
              key: field.id,
            }))}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Product",
                key: "productId",
                width: 200,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.productId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select product"
                        allowClear
                        style={{ width: "100%" }}
                        options={PRODUCT_OPTIONS}
                      />
                    )}
                  />
                ),
              },
              {
                title: "Qty",
                key: "quantity",
                width: 100,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={1}
                        style={{ width: "100%" }}
                        onChange={(value) => field.onChange(value || 1)}
                      />
                    )}
                  />
                ),
              },
              {
                title: "Unit Price",
                key: "unitPrice",
                width: 120,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.unitPrice`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={0}
                        precision={2}
                        prefix="$"
                        style={{ width: "100%" }}
                        onChange={(value) => field.onChange(value || 0)}
                      />
                    )}
                  />
                ),
              },
              {
                title: "Total",
                key: "total",
                width: 120,
                render: () => {
                  const line = watchedLines?.[0];
                  const total = (line?.quantity || 0) * (line?.unitPrice || 0);
                  return `$${total.toFixed(2)}`;
                },
              },
              {
                title: "",
                key: "action",
                width: 50,
                render: (_: unknown, __: unknown, index: number) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length === 1}
                  />
                ),
              },
            ]}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() =>
              append({
                id: String(Date.now()),
                productId: undefined,
                quantity: 1,
                unitPrice: 0,
                taxRate: 0.1,
              })
            }
            className={styles.addBtn}
          >
            Add Line
          </Button>
        </Card>

        <div className={styles.actions}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSave("DRAFT")}
              loading={saving}
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              onClick={() => handleSave("SENT")}
              loading={saving}
            >
              Create & Send
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default InvoiceForm;
