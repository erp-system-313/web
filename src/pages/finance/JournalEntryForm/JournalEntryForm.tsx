import { useNavigate } from "react-router-dom";
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
  CheckOutlined,
} from "@ant-design/icons";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAccounts } from "../../../hooks";
import { journalEntryFormSchema } from "../../../schemas/finance";
import styles from "./JournalEntryForm.module.css";

const JOURNAL_TYPE_OPTIONS = [
  { value: "SALES", label: "Sales" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "MISC", label: "Miscellaneous" },
];

interface JournalLineData {
  id: string;
  accountId?: number;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalEntryFormData {
  date: string;
  description: string;
  reference?: string;
  journalType: string;
  lines: JournalLineData[];
}

export const JournalEntryForm: React.FC = () => {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts();

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: yupResolver(journalEntryFormSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
      journalType: "ADJUSTMENT",
      lines: [
        { id: "1", accountId: undefined, debit: 0, credit: 0, description: "" },
        { id: "2", accountId: undefined, debit: 0, credit: 0, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");

  const totalDebit =
    watchedLines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
  const totalCredit =
    watchedLines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSave = () => {
    message.success("Journal entry saved (mock)");
    navigate("/finance/journal");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/finance/journal")}
        >
          Back
        </Button>
        <h1>New Journal Entry</h1>
      </div>

      <Form layout="vertical">
        <Card title="Entry Details" className={styles.card}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Date"
                help={errors.date?.message}
                validateStatus={errors.date ? "error" : ""}
              >
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Journal Type"
                help={errors.journalType?.message}
                validateStatus={errors.journalType ? "error" : ""}
              >
                <Controller
                  name="journalType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={JOURNAL_TYPE_OPTIONS} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Reference">
                <Controller
                  name="reference"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g., INV-001" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Description"
                help={errors.description?.message}
                validateStatus={errors.description ? "error" : ""}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      rows={2}
                      placeholder="Enter journal entry description..."
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Journal Lines" className={styles.card}>
          <Table
            dataSource={fields.map((field) => ({ ...field, key: field.id }))}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Account",
                key: "accountId",
                width: 250,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.accountId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select account"
                        allowClear
                        style={{ width: "100%" }}
                        options={accounts.map((a) => ({
                          value: a.id,
                          label: `${a.code} - ${a.name}`,
                        }))}
                      />
                    )}
                  />
                ),
              },
              {
                title: "Description",
                key: "description",
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Line description (optional)"
                      />
                    )}
                  />
                ),
              },
              {
                title: "Debit",
                key: "debit",
                width: 150,
                align: "right" as const,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.debit`}
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
                title: "Credit",
                key: "credit",
                width: 150,
                align: "right" as const,
                render: (_: unknown, __: unknown, index: number) => (
                  <Controller
                    name={`lines.${index}.credit`}
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
                title: "",
                key: "action",
                width: 50,
                render: (_: unknown, __: unknown, index: number) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => fields.length > 2 && remove(index)}
                    disabled={fields.length <= 2}
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
                accountId: undefined,
                debit: 0,
                credit: 0,
                description: "",
              })
            }
            style={{ marginTop: 16 }}
          >
            Add Line
          </Button>

          <div className={styles.totals}>
            <div className={styles.totalItem}>
              <div className={styles.totalLabel}>Total Debit</div>
              <div className={styles.totalValue}>${totalDebit.toFixed(2)}</div>
            </div>
            <div className={styles.totalItem}>
              <div className={styles.totalLabel}>Total Credit</div>
              <div className={styles.totalValue}>${totalCredit.toFixed(2)}</div>
            </div>
            <div className={styles.totalItem}>
              {isBalanced ? (
                <div className={styles.balanceSuccess}>
                  <CheckOutlined /> Entry is balanced
                </div>
              ) : (
                <div className={styles.balanceWarning}>
                  Entry is unbalanced (diff: $
                  {Math.abs(totalDebit - totalCredit).toFixed(2)})
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className={styles.actions}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!isBalanced}
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSave}
              disabled={!isBalanced}
            >
              Post Entry
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default JournalEntryForm;
