import { useState, useMemo } from "react";
import {
  Button,
  Tree,
  Card,
  Tag,
  Modal,
  Input,
  Select,
  Table,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Divider,
  Form,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  WalletOutlined,
  BankOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAccounts } from "../../../hooks";
import { editAccountSchema, addAccountSchema } from "../../../schemas/finance";
import type { Account, AccountType } from "../../../types/finance";
import styles from "./ChartOfAccounts.module.css";

const getTypeColor = (type: AccountType): string => {
  switch (type) {
    case "ASSET":
      return "blue";
    case "LIABILITY":
      return "red";
    case "EQUITY":
      return "purple";
    case "INCOME":
      return "green";
    case "EXPENSE":
      return "orange";
    default:
      return "default";
  }
};

const getTypeIcon = (type: AccountType) => {
  switch (type) {
    case "ASSET":
      return <WalletOutlined />;
    case "LIABILITY":
      return <BankOutlined />;
    case "EQUITY":
      return <FileTextOutlined />;
    case "INCOME":
      return <DollarOutlined />;
    case "EXPENSE":
      return <ShoppingOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: "ASSET", label: "Asset" },
  { value: "LIABILITY", label: "Liability" },
  { value: "EQUITY", label: "Equity" },
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
];

interface EditFormValues {
  name: string;
  type: string;
}

interface AddFormValues {
  code: string;
  name: string;
  type: string;
  parentId?: number;
}

export const ChartOfAccounts: React.FC = () => {
  const { data: accounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | null>(null);

  const editForm = useForm<EditFormValues>({
    resolver: yupResolver(editAccountSchema) as any,
    defaultValues: { name: "", type: "" },
  });

  const addForm = useForm<AddFormValues>({
    resolver: yupResolver(addAccountSchema) as any,
    defaultValues: { code: "", name: "", type: "", parentId: undefined },
  });

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        searchText === "" ||
        account.code.toLowerCase().includes(searchText.toLowerCase()) ||
        account.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = typeFilter === null || account.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchText, typeFilter]);

  const selectedAccountData = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  const transactionCount = useMemo(() => {
    if (!selectedAccountId) return 0;
    return ((selectedAccountId * 17) % 100) + 10;
  }, [selectedAccountId]);

  const typeSummary = useMemo(
    () => ({
      ASSET: accounts
        .filter((a) => a.type === "ASSET")
        .reduce((s, a) => s + a.balance, 0),
      LIABILITY: accounts
        .filter((a) => a.type === "LIABILITY")
        .reduce((s, a) => s + a.balance, 0),
      EQUITY: accounts
        .filter((a) => a.type === "EQUITY")
        .reduce((s, a) => s + a.balance, 0),
      INCOME: accounts
        .filter((a) => a.type === "INCOME")
        .reduce((s, a) => s + a.balance, 0),
      EXPENSE: accounts
        .filter((a) => a.type === "EXPENSE")
        .reduce((s, a) => s + a.balance, 0),
    }),
    [accounts],
  );

  const treeData = useMemo(() => {
    const grouped: Record<string, Account[]> = {};
    filteredAccounts.forEach((account) => {
      if (!grouped[account.type]) grouped[account.type] = [];
      grouped[account.type].push(account);
    });

    return Object.entries(grouped).map(([type, accts]) => ({
      key: type,
      title: (
        <div className={styles.treeTypeLabel}>
          <Tag
            color={getTypeColor(type as AccountType)}
            icon={getTypeIcon(type as AccountType)}
          >
            {type}
          </Tag>
          <span className={styles.treeTypeBalance}>
            ${typeSummary[type as AccountType].toFixed(2)}
          </span>
        </div>
      ),
      children: accts.map((account) => ({
        key: account.id,
        title: (
          <div
            className={`${styles.treeAccountRow} ${selectedAccountId === account.id ? styles.selected : ""}`}
            onClick={() => setSelectedAccountId(account.id)}
          >
            <span className={styles.accountCode}>{account.code}</span>
            <span className={styles.accountName}>{account.name}</span>
            <span className={styles.accountBalance}>
              ${account.balance.toFixed(2)}
            </span>
          </div>
        ),
      })),
    }));
  }, [filteredAccounts, selectedAccountId, typeSummary]);

  const handleEditSubmit = () => {
    message.success(`Account ${selectedAccount?.code} updated (mock)`);
    setEditModalOpen(false);
    setSelectedAccount(null);
    editForm.reset();
  };

  const handleAddSubmit = () => {
    message.success("Account created (mock)");
    setAddModalOpen(false);
    addForm.reset();
  };

  const openEditModal = (account: Account) => {
    setSelectedAccount(account);
    editForm.reset({ name: account.name, type: account.type });
    setEditModalOpen(true);
  };

  const tableColumns: ColumnsType<Account> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code: string) => (
        <strong style={{ fontFamily: "monospace" }}>{code}</strong>
      ),
    },
    { title: "Account Name", dataIndex: "name", key: "name" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: AccountType) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 140,
      align: "right",
      render: (balance: number) => (
        <span style={{ fontFamily: "monospace" }}>${balance.toFixed(2)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_: unknown, record: Account) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Chart of Accounts</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            addForm.reset();
            setAddModalOpen(true);
          }}
        >
          Add Account
        </Button>
      </div>

      <Row gutter={16} className={styles.summaryRow}>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Assets"
              value={typeSummary.ASSET}
              precision={2}
              prefix={<WalletOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Liabilities"
              value={typeSummary.LIABILITY}
              precision={2}
              prefix={<BankOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Equity"
              value={typeSummary.EQUITY}
              precision={2}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Income"
              value={typeSummary.INCOME}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Expenses"
              value={typeSummary.EXPENSE}
              precision={2}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.summaryCard}>
            <Statistic
              title="Total Accounts"
              value={accounts.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.splitView}>
        <Col span={8}>
          <Card
            title="Account Tree"
            className={styles.treeCard}
            extra={
              <Space>
                <Input.Search
                  placeholder="Search accounts..."
                  onSearch={setSearchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
                <Select
                  placeholder="Filter by type"
                  allowClear
                  style={{ width: 140 }}
                  onChange={(value) =>
                    setTypeFilter(value as AccountType | null)
                  }
                  options={ACCOUNT_TYPE_OPTIONS}
                />
              </Space>
            }
          >
            <Tree
              showLine
              defaultExpandAll
              treeData={treeData}
              titleRender={(node) => node.title}
            />
          </Card>
        </Col>

        <Col span={16}>
          <Card
            title={
              selectedAccountData
                ? `Account: ${selectedAccountData.name}`
                : "All Accounts"
            }
            className={styles.tableCard}
            extra={
              selectedAccountData && (
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(selectedAccountData)}
                  >
                    Edit
                  </Button>
                  <Button onClick={() => setSelectedAccountId(null)}>
                    View All
                  </Button>
                </Space>
              )
            }
          >
            {selectedAccountData ? (
              <div className={styles.accountDetails}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Account Code</label>
                      <span className={styles.detailValue}>
                        {selectedAccountData.code}
                      </span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Account Type</label>
                      <Tag color={getTypeColor(selectedAccountData.type)}>
                        {selectedAccountData.type}
                      </Tag>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Account Name</label>
                      <span className={styles.detailValue}>
                        {selectedAccountData.name}
                      </span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Status</label>
                      <Tag
                        color={
                          selectedAccountData.isActive ? "success" : "default"
                        }
                      >
                        {selectedAccountData.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Current Balance</label>
                      <span className={styles.balanceValue}>
                        ${selectedAccountData.balance.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailGroup}>
                      <label>Parent Account</label>
                      <span className={styles.detailValue}>
                        {selectedAccountData.parentId || "None (Root)"}
                      </span>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <div className={styles.quickStats}>
                  <h4>Quick Stats</h4>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="YTD Debit"
                        value={selectedAccountData.balance * 0.6}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="YTD Credit"
                        value={selectedAccountData.balance * 0.4}
                        precision={2}
                        prefix="$"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Transactions"
                        value={transactionCount}
                      />
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <Table
                dataSource={filteredAccounts}
                columns={tableColumns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                onRow={(record) => ({
                  onClick: () => setSelectedAccountId(record.id),
                  style: { cursor: "pointer" },
                })}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={`Edit Account: ${selectedAccount?.code}`}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedAccount(null);
          editForm.reset();
        }}
        onOk={() => editForm.handleSubmit(handleEditSubmit)()}
      >
        <Form layout="vertical">
          <Form.Item
            label="Account Name"
            help={editForm.formState.errors.name?.message}
            validateStatus={editForm.formState.errors.name ? "error" : ""}
          >
            <Input
              {...editForm.register("name")}
              placeholder="Enter account name"
            />
          </Form.Item>
          <Form.Item
            label="Account Type"
            help={editForm.formState.errors.type?.message}
            validateStatus={editForm.formState.errors.type ? "error" : ""}
          >
            <Select
              {...editForm.register("type")}
              placeholder="Select account type"
              options={ACCOUNT_TYPE_OPTIONS}
              onChange={(value) => editForm.setValue("type", value)}
              value={editForm.watch("type")}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Account"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          addForm.reset();
        }}
        onOk={() => addForm.handleSubmit(handleAddSubmit)()}
      >
        <Form layout="vertical">
          <Form.Item
            label="Account Code"
            help={addForm.formState.errors.code?.message}
            validateStatus={addForm.formState.errors.code ? "error" : ""}
          >
            <Input {...addForm.register("code")} placeholder="e.g., 1100-1" />
          </Form.Item>
          <Form.Item
            label="Account Name"
            help={addForm.formState.errors.name?.message}
            validateStatus={addForm.formState.errors.name ? "error" : ""}
          >
            <Input
              {...addForm.register("name")}
              placeholder="e.g., Accounts Receivable"
            />
          </Form.Item>
          <Form.Item
            label="Account Type"
            help={addForm.formState.errors.type?.message}
            validateStatus={addForm.formState.errors.type ? "error" : ""}
          >
            <Select
              {...addForm.register("type")}
              placeholder="Select account type"
              options={ACCOUNT_TYPE_OPTIONS}
              onChange={(value) => addForm.setValue("type", value)}
              value={addForm.watch("type")}
            />
          </Form.Item>
          <Form.Item label="Parent Account">
            <Select
              placeholder="Select parent account (optional)"
              allowClear
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name}`,
              }))}
              onChange={(value) => addForm.setValue("parentId", value)}
              value={addForm.watch("parentId")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChartOfAccounts;
