export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE";

export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "INCOME"
  | "EXPENSE";

export type JournalType = "SALES" | "PURCHASE" | "ADJUSTMENT" | "MISC";

export type JournalEntryStatus = "DRAFT" | "POSTED";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  salesOrderId?: number;
  customerId: number;
  customerName?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  createdAt: string;
  updatedAt: string;
  lines?: InvoiceLine[];
  payments?: Payment[];
}

export interface InvoiceLine {
  id: number;
  invoiceId: number;
  productId?: number;
  productName?: string;
  productSku?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  glAccountId?: number;
  glAccountName?: string;
  taxCode?: string;
  taxRate?: number;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  parentId?: number;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Account[];
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  status: JournalEntryStatus;
  journalType: JournalType;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: number;
  entryId: number;
  accountId: number;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateInvoiceDto {
  customerId: number;
  salesOrderId?: number;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: {
    productId?: number;
    description?: string;
    quantity: number;
    unitPrice: number;
    glAccountId?: number;
    taxCode?: string;
    taxRate?: number;
  }[];
}

export interface RecordPaymentDto {
  invoiceId: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface CreateJournalEntryDto {
  date: string;
  description: string;
  reference?: string;
  journalType: JournalType;
  lines: {
    accountId: number;
    debit: number;
    credit: number;
    description?: string;
  }[];
}

export interface CreateAccountDto {
  code: string;
  name: string;
  type: AccountType;
  parentId?: number;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export interface JournalFilters {
  search?: string;
  status?: JournalEntryStatus;
  journalType?: JournalType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export interface AccountFilters {
  search?: string;
  type?: AccountType;
  isActive?: boolean;
  parentId?: number;
  page?: number;
  size?: number;
}
