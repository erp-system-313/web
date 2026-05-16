import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Table,
  DatePicker,
  Space,
  Statistic,
  Row,
  Col,
  Form,
  Select,
  Spin,
} from "antd";
import { PrinterOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiClient } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";
import { FormCard } from "../../../components/common";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface TrialBalanceRow {
  accountId: number;
  code: string;
  name: string;
  accountType: string;
  internalGroup: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

interface ProfitLossRow {
  accountId: number;
  code: string;
  name: string;
  balance: number;
}

interface BalanceSheetRow {
  accountId: number;
  code: string;
  name: string;
  balance: number;
}

interface GeneralLedgerRow {
  id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("trial-balance");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState<Dayjs>(dayjs());
  const [dateFrom, setDateFrom] = useState<Dayjs>(dayjs().startOf("year"));
  const [dateTo, setDateTo] = useState<Dayjs>(dayjs().endOf("year"));
  const [accountId, setAccountId] = useState<number | undefined>();
  const [accounts, setAccounts] = useState<{ value: number; label: string }[]>(
    [],
  );
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = "";
      switch (activeTab) {
        case "trial-balance":
          url =
            endpoints.reports.trialBalance +
            `?asOfDate=${asOfDate.format("YYYY-MM-DD")}`;
          break;
        case "general-ledger": {
          if (!accountId) {
            setLoading(false);
            return;
          }
          url =
            endpoints.reports.generalLedger +
            `?accountId=${accountId}&dateFrom=${dateFrom.format("YYYY-MM-DD")}&dateTo=${dateTo.format("YYYY-MM-DD")}`;
          break;
        }
        case "profit-loss":
          url =
            endpoints.reports.profitLoss +
            `?dateFrom=${dateFrom.format("YYYY-MM-DD")}&dateTo=${dateTo.format("YYYY-MM-DD")}`;
          break;
        case "balance-sheet":
          url =
            endpoints.reports.balanceSheet +
            `?asOfDate=${asOfDate.format("YYYY-MM-DD")}`;
          break;
      }
      const response = await apiClient.get(url);
      setData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiClient
      .get(endpoints.accounts.list + "?page=0&size=200")
      .then((res: any) => {
        const items = res.data.data.content || [];
        setAccounts(
          items.map((a: any) => ({
            value: a.id,
            label: `${a.code} - ${a.name}`,
          })),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const tbColumns = [
    { title: "Code", dataIndex: "code", key: "code", width: 100 },
    { title: "Account", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "accountType", key: "accountType", width: 130 },
    {
      title: "Debit",
      dataIndex: "totalDebit",
      key: "totalDebit",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
    {
      title: "Credit",
      dataIndex: "totalCredit",
      key: "totalCredit",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
  ];

  const glColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
  ];

  const plColumns = [
    { title: "Account", dataIndex: "name", key: "name" },
    {
      title: "Amount",
      dataIndex: "balance",
      key: "balance",
      width: 150,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
  ];

  const bsColumns = [
    { title: "Account", dataIndex: "name", key: "name" },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 150,
      align: "right" as const,
      render: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
  ];

  const renderTabContent = () => {
    if (loading)
      return <Spin style={{ display: "block", margin: "40px auto" }} />;
    if (!data) return <p>No data available. Adjust filters and try again.</p>;

    switch (activeTab) {
      case "trial-balance":
        return (
          <>
            <Table
              dataSource={data.rows || []}
              columns={tbColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
              summary={() =>
                data.totals ? (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Totals</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong>
                          ${(data.totals.totalDebit ?? 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <strong>
                          ${(data.totals.totalCredit ?? 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <strong>
                          ${(data.totals.netBalance ?? 0).toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                ) : null
              }
            />
          </>
        );
      case "general-ledger":
        return (
          <Table
            dataSource={data.rows || []}
            columns={glColumns}
            rowKey="id"
            pagination={{ pageSize: 50 }}
            size="small"
          />
        );
      case "profit-loss":
        return (
          <>
            <h3>Income</h3>
            <Table
              dataSource={data.incomeRows || []}
              columns={plColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
            />
            <h3 style={{ marginTop: 24 }}>Expenses</h3>
            <Table
              dataSource={data.expenseRows || []}
              columns={plColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Income"
                    value={data.totalIncome ?? 0}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Expenses"
                    value={data.totalExpense ?? 0}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Net Profit / Loss"
                    value={data.netProfitLoss ?? 0}
                    precision={2}
                    prefix="$"
                    valueStyle={{
                      color:
                        (data.netProfitLoss ?? 0) >= 0 ? "#52c41a" : "#ff4d4f",
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        );
      case "balance-sheet":
        return (
          <>
            <h3>Assets</h3>
            <Table
              dataSource={data.assetRows || []}
              columns={bsColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
            />
            <h3 style={{ marginTop: 24 }}>Liabilities</h3>
            <Table
              dataSource={data.liabilityRows || []}
              columns={bsColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
            />
            <h3 style={{ marginTop: 24 }}>Equity</h3>
            <Table
              dataSource={data.equityRows || []}
              columns={bsColumns}
              rowKey="accountId"
              pagination={false}
              size="small"
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Assets"
                    value={data.totalAssets ?? 0}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Liabilities"
                    value={data.totalLiabilities ?? 0}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Total Equity"
                    value={data.totalEquity ?? 0}
                    precision={2}
                    prefix="$"
                  />
                </Card>
              </Col>
            </Row>
          </>
        );
      default:
        return null;
    }
  };

  const tabList = [
    { key: "trial-balance", tab: "Trial Balance" },
    { key: "general-ledger", tab: "General Ledger" },
    { key: "profit-loss", tab: "Profit & Loss" },
    { key: "balance-sheet", tab: "Balance Sheet" },
  ];

  return (
    <FormCard title="Financial Reports" backPath="/finance/invoices">
      <div ref={printRef}>
        <Card
          tabList={tabList}
          activeTabKey={activeTab}
          onTabChange={(key) => setActiveTab(key)}
          extra={
            <Space>
              {activeTab === "trial-balance" && (
                <DatePicker
                  value={asOfDate}
                  onChange={(d) => setAsOfDate(d || dayjs())}
                  picker="date"
                />
              )}
              {activeTab === "general-ledger" && (
                <>
                  <Select
                    placeholder="Select account"
                    options={accounts}
                    value={accountId}
                    onChange={setAccountId}
                    style={{ width: 250 }}
                    showSearch
                    filterOption={(input, option) =>
                      ((option?.label as string) || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                  <DatePicker
                    value={dateFrom}
                    onChange={(d) => setDateFrom(d || dayjs().startOf("year"))}
                  />
                  <DatePicker
                    value={dateTo}
                    onChange={(d) => setDateTo(d || dayjs().endOf("year"))}
                  />
                </>
              )}
              {activeTab === "profit-loss" && (
                <>
                  <DatePicker
                    value={dateFrom}
                    onChange={(d) => setDateFrom(d || dayjs().startOf("year"))}
                  />
                  <DatePicker
                    value={dateTo}
                    onChange={(d) => setDateTo(d || dayjs().endOf("year"))}
                  />
                </>
              )}
              {activeTab === "balance-sheet" && (
                <DatePicker
                  value={asOfDate}
                  onChange={(d) => setAsOfDate(d || dayjs())}
                  picker="date"
                />
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchReport}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print / PDF
              </Button>
            </Space>
          }
        >
          {renderTabContent()}
        </Card>
      </div>
    </FormCard>
  );
};

export default ReportsPage;
