import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Space,
  Select,
  Table,
  Tag,
  Modal,
  message as antdMessage,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { DataTable, StatusBadge } from "../../../components/common";
import { useJournalEntries, useJournalEntry } from "../../../hooks";
import type {
  JournalEntry,
  JournalEntryLine,
  JournalEntryStatus,
} from "../../../types/finance";
import styles from "./JournalEntries.module.css";

export const JournalEntries: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    JournalEntryStatus | undefined
  >();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const { data, loading, total, refetch } = useJournalEntries({
    search: search || undefined,
    status: statusFilter,
  });
  const { post, reverse, saving } = useJournalEntry(selectedEntry?.id);

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewModalOpen(true);
  };

  const handlePost = async () => {
    if (!selectedEntry) return;
    const result = await post();
    if (result) {
      antdMessage.success("Entry posted successfully");
      setViewModalOpen(false);
      refetch();
    } else {
      antdMessage.error("Failed to post entry");
    }
  };

  const handleReverse = async () => {
    if (!selectedEntry) return;
    const result = await reverse();
    if (result) {
      antdMessage.success("Entry reversed successfully");
      setViewModalOpen(false);
      refetch();
    } else {
      antdMessage.error("Failed to reverse entry");
    }
  };

  const calculateTotals = (entry: JournalEntry) => {
    const debit = entry.lines?.reduce((sum, l) => sum + l.debit, 0) || 0;
    const credit = entry.lines?.reduce((sum, l) => sum + l.credit, 0) || 0;
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 };
  };

  const columns: ColumnsType<JournalEntry> = [
    {
      title: "Entry #",
      dataIndex: "entryNumber",
      key: "entryNumber",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Type",
      dataIndex: "journalType",
      key: "journalType",
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: "Debit",
      key: "debit",
      align: "right" as const,
      render: (_: unknown, record: JournalEntry) => {
        const { debit } = calculateTotals(record);
        return `$${debit.toFixed(2)}`;
      },
    },
    {
      title: "Credit",
      key: "credit",
      align: "right" as const,
      render: (_: unknown, record: JournalEntry) => {
        const { credit } = calculateTotals(record);
        return `$${credit.toFixed(2)}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: JournalEntryStatus) => <StatusBadge status={s} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: JournalEntry) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleView(record)}
            disabled={record.status === "POSTED"}
          />
        </Space>
      ),
    },
  ];

  const lineColumns: ColumnsType<JournalEntryLine> = [
    { title: "Account", dataIndex: "accountName", key: "accountName" },
    { title: "Code", dataIndex: "accountCode", key: "accountCode" },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      align: "right" as const,
      render: (v: number) => (v > 0 ? `$${v.toFixed(2)}` : "-"),
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      align: "right" as const,
      render: (v: number) => (v > 0 ? `$${v.toFixed(2)}` : "-"),
    },
    { title: "Description", dataIndex: "description", key: "description" },
  ];

  const totals = selectedEntry
    ? calculateTotals(selectedEntry)
    : { debit: 0, credit: 0, balanced: true };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Journal Entries</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/finance/journal/new")}
        >
          New Entry
        </Button>
      </div>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        onRefresh={refetch}
        searchPlaceholder="Search entries..."
        onSearch={setSearch}
        actions={
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 140 }}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "POSTED", label: "Posted" },
            ]}
          />
        }
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (t) => `Total ${t} entries`,
        }}
      />

      <Modal
        title={`Journal Entry: ${selectedEntry?.entryNumber || ""}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        width={800}
        footer={
          selectedEntry?.status === "DRAFT" ? (
            <Space>
              <Button onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handlePost}
                loading={saving}
              >
                Post Entry
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button
                icon={<UndoOutlined />}
                onClick={handleReverse}
                loading={saving}
              >
                Reverse Entry
              </Button>
            </Space>
          )
        }
      >
        {selectedEntry && (
          <div>
            <div className={styles.modalInfo}>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedEntry.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Description:</strong> {selectedEntry.description}
              </p>
              <p>
                <strong>Type:</strong> {selectedEntry.journalType}
              </p>
              <p>
                <strong>Reference:</strong> {selectedEntry.reference || "-"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selectedEntry.status} />
              </p>
            </div>
            <Table
              dataSource={selectedEntry.lines || []}
              columns={lineColumns}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong
                        style={{
                          color: totals.balanced ? "#52c41a" : "#ff4d4f",
                        }}
                      >
                        ${totals.debit.toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <strong
                        style={{
                          color: totals.balanced ? "#52c41a" : "#ff4d4f",
                        }}
                      >
                        ${totals.credit.toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
            {!totals.balanced && (
              <div className={styles.warning}>
                ⚠️ Entry is unbalanced! Debits ({totals.debit.toFixed(2)}) ≠
                Credits ({totals.credit.toFixed(2)})
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JournalEntries;
