import type { JournalEntry } from "../types/finance";

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 1,
    entryNumber: "JE-2024-0001",
    date: "2024-01-01",
    description: "Initial setup - Owner investment",
    reference: "INIT-001",
    status: "POSTED",
    journalType: "ADJUSTMENT",
    createdBy: 1,
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z",
    postedAt: "2024-01-01T09:00:00Z",
    lines: [
      {
        id: 1,
        entryId: 1,
        accountId: 7,
        accountCode: "1000",
        accountName: "Cash",
        debit: 50000,
        credit: 0,
      },
      {
        id: 2,
        entryId: 1,
        accountId: 12,
        accountCode: "3000",
        accountName: "Owner Equity",
        debit: 0,
        credit: 50000,
      },
    ],
  },
  {
    id: 2,
    entryNumber: "JE-2024-0002",
    date: "2024-01-15",
    description: "Record sales from INV-2024-0001",
    reference: "INV-2024-0001",
    status: "POSTED",
    journalType: "SALES",
    createdBy: 1,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    postedAt: "2024-01-15T10:30:00Z",
    lines: [
      {
        id: 3,
        entryId: 2,
        accountId: 8,
        accountCode: "1100",
        accountName: "Accounts Receivable",
        debit: 505.89,
        credit: 0,
      },
      {
        id: 4,
        entryId: 2,
        accountId: 1,
        accountCode: "4000",
        accountName: "Sales Revenue",
        debit: 0,
        credit: 459.9,
      },
      {
        id: 5,
        entryId: 2,
        accountId: 11,
        accountCode: "2100",
        accountName: "Sales Tax Payable",
        debit: 0,
        credit: 45.99,
      },
    ],
  },
  {
    id: 3,
    entryNumber: "JE-2024-0003",
    date: "2024-02-01",
    description: "Record sales from INV-2024-0002",
    reference: "INV-2024-0002",
    status: "POSTED",
    journalType: "SALES",
    createdBy: 1,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    postedAt: "2024-02-01T09:00:00Z",
    lines: [
      {
        id: 6,
        entryId: 3,
        accountId: 8,
        accountCode: "1100",
        accountName: "Accounts Receivable",
        debit: 1358.02,
        credit: 0,
      },
      {
        id: 7,
        entryId: 3,
        accountId: 1,
        accountCode: "4000",
        accountName: "Sales Revenue",
        debit: 0,
        credit: 1234.56,
      },
      {
        id: 8,
        entryId: 3,
        accountId: 11,
        accountCode: "2100",
        accountName: "Sales Tax Payable",
        debit: 0,
        credit: 123.46,
      },
    ],
  },
  {
    id: 4,
    entryNumber: "JE-2024-0004",
    date: "2024-03-05",
    description: "Received payment from Acme Corporation",
    reference: "TRF-001",
    status: "POSTED",
    journalType: "ADJUSTMENT",
    createdBy: 1,
    createdAt: "2024-03-05T11:00:00Z",
    updatedAt: "2024-03-05T11:00:00Z",
    postedAt: "2024-03-05T11:00:00Z",
    lines: [
      {
        id: 9,
        entryId: 4,
        accountId: 7,
        accountCode: "1000",
        accountName: "Cash",
        debit: 505.89,
        credit: 0,
      },
      {
        id: 10,
        entryId: 4,
        accountId: 8,
        accountCode: "1100",
        accountName: "Accounts Receivable",
        debit: 0,
        credit: 505.89,
      },
    ],
  },
  {
    id: 5,
    entryNumber: "JE-2024-0005",
    date: "2024-03-10",
    description: "Monthly rent payment",
    status: "DRAFT",
    journalType: "MISC",
    createdBy: 1,
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-03-10T08:00:00Z",
    lines: [
      {
        id: 11,
        entryId: 5,
        accountId: 5,
        accountCode: "5200",
        accountName: "Rent Expense",
        debit: 2500,
        credit: 0,
      },
      {
        id: 12,
        entryId: 5,
        accountId: 7,
        accountCode: "1000",
        accountName: "Cash",
        debit: 0,
        credit: 2500,
      },
    ],
  },
  {
    id: 6,
    entryNumber: "JE-2024-0006",
    date: "2024-03-15",
    description: "Inventory purchase",
    status: "DRAFT",
    journalType: "PURCHASE",
    createdBy: 2,
    createdAt: "2024-03-15T14:00:00Z",
    updatedAt: "2024-03-15T14:00:00Z",
    lines: [
      {
        id: 13,
        entryId: 6,
        accountId: 9,
        accountCode: "1200",
        accountName: "Inventory",
        debit: 5000,
        credit: 0,
      },
      {
        id: 14,
        entryId: 6,
        accountId: 10,
        accountCode: "2000",
        accountName: "Accounts Payable",
        debit: 0,
        credit: 5000,
      },
    ],
  },
];

let nextEntryId = 7;

export const addJournalEntry = (
  entry: Omit<JournalEntry, "id" | "entryNumber" | "createdAt" | "updatedAt">,
): JournalEntry => {
  const now = new Date().toISOString();
  const newEntry: JournalEntry = {
    ...entry,
    id: nextEntryId++,
    entryNumber: `JE-2024-${String(nextEntryId - 1).padStart(4, "0")}`,
    createdAt: now,
    updatedAt: now,
  };
  mockJournalEntries.unshift(newEntry);
  return newEntry;
};

export const updateJournalEntry = (
  id: number,
  updates: Partial<JournalEntry>,
): JournalEntry | null => {
  const index = mockJournalEntries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  mockJournalEntries[index] = {
    ...mockJournalEntries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockJournalEntries[index];
};

export const postJournalEntry = (id: number): JournalEntry | null => {
  const entry = mockJournalEntries.find((e) => e.id === id);
  if (!entry || entry.status === "POSTED") return null;

  entry.status = "POSTED";
  entry.postedAt = new Date().toISOString();
  entry.updatedAt = new Date().toISOString();

  entry.lines?.forEach((line) => {
    const account = mockAccounts.find((a) => a.id === line.accountId);
    if (account) {
      if (line.debit > 0) account.balance += line.debit;
      if (line.credit > 0) account.balance -= line.credit;
    }
  });

  return entry;
};

import { mockAccounts } from "./accountsMockData";
