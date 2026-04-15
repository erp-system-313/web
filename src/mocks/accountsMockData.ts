import type { Account } from "../types/finance";

export const mockAccounts: Account[] = [
  {
    id: 1,
    code: "4000",
    name: "Sales Revenue",
    type: "INCOME",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "4100",
    name: "Service Revenue",
    type: "INCOME",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    code: "5000",
    name: "Cost of Goods Sold",
    type: "EXPENSE",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    code: "5100",
    name: "Salaries Expense",
    type: "EXPENSE",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    code: "5200",
    name: "Rent Expense",
    type: "EXPENSE",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    code: "5300",
    name: "Utilities Expense",
    type: "EXPENSE",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    code: "1000",
    name: "Cash",
    type: "ASSET",
    balance: 15000,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 8,
    code: "1100",
    name: "Accounts Receivable",
    type: "ASSET",
    balance: 8591.36,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 9,
    code: "1200",
    name: "Inventory",
    type: "ASSET",
    balance: 50000,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 10,
    code: "2000",
    name: "Accounts Payable",
    type: "LIABILITY",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 11,
    code: "2100",
    name: "Sales Tax Payable",
    type: "LIABILITY",
    balance: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 12,
    code: "3000",
    name: "Owner Equity",
    type: "EQUITY",
    balance: 70000,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

let nextAccountId = 13;

export const addAccount = (
  account: Omit<Account, "id" | "createdAt" | "updatedAt">,
): Account => {
  const now = new Date().toISOString();
  const newAccount: Account = {
    ...account,
    id: nextAccountId++,
    createdAt: now,
    updatedAt: now,
  };
  mockAccounts.push(newAccount);
  return newAccount;
};

export const updateAccount = (
  id: number,
  updates: Partial<Account>,
): Account | null => {
  const index = mockAccounts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  mockAccounts[index] = {
    ...mockAccounts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockAccounts[index];
};
