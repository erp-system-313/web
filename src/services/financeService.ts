import type {
  Invoice,
  Payment,
  Account,
  JournalEntry,
  InvoiceFilters,
  JournalFilters,
  CreateInvoiceDto,
  RecordPaymentDto,
  CreateJournalEntryDto,
  CreateAccountDto,
} from "../types/finance";
import {
  mockInvoices,
  addInvoice,
  updateInvoice as updateMockInvoice,
  recordPayment as recordMockPayment,
} from "../mocks/invoicesMockData";
import {
  mockAccounts,
  addAccount,
  updateAccount as updateMockAccount,
} from "../mocks/accountsMockData";
import {
  mockJournalEntries,
  addJournalEntry,
  updateJournalEntry as updateMockJournalEntry,
  postJournalEntry as postMockJournalEntry,
} from "../mocks/journalMockData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const financeService = {
  invoices: {
    getAll: async (
      filters?: InvoiceFilters,
    ): Promise<{ items: Invoice[]; total: number }> => {
      await delay(300);
      let items = [...mockInvoices];

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(search) ||
            i.customerName?.toLowerCase().includes(search),
        );
      }

      if (filters?.status) {
        items = items.filter((i) => i.status === filters.status);
      }

      if (filters?.customerId) {
        items = items.filter((i) => i.customerId === filters.customerId);
      }

      return { items, total: items.length };
    },

    getById: async (id: number): Promise<Invoice | null> => {
      await delay(200);
      return mockInvoices.find((i) => i.id === id) || null;
    },

    create: async (data: CreateInvoiceDto): Promise<Invoice> => {
      await delay(400);
      const subtotal = data.lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      );
      const taxAmount = data.lines.reduce(
        (sum, line) =>
          sum + line.unitPrice * line.quantity * (line.taxRate || 0.1),
        0,
      );

      return addInvoice({
        customerId: data.customerId,
        salesOrderId: data.salesOrderId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        status: data.status,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
        paidAmount: 0,
        balanceDue: subtotal + taxAmount,
        lines: data.lines.map((line, idx) => ({
          id: Date.now() + idx,
          invoiceId: 0,
          productId: line.productId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.unitPrice * line.quantity,
          glAccountId: line.glAccountId,
          taxCode: line.taxCode,
          taxRate: line.taxRate,
        })),
      });
    },

    update: async (
      id: number,
      data: Partial<CreateInvoiceDto>,
    ): Promise<Invoice | null> => {
      await delay(400);
      return updateMockInvoice(id, data as unknown as Partial<Invoice>);
    },

    recordPayment: async (data: RecordPaymentDto): Promise<Payment> => {
      await delay(300);
      return recordMockPayment(data);
    },
  },

  payments: {
    getByInvoice: async (invoiceId: number): Promise<Payment[]> => {
      await delay(200);
      return mockInvoices.find((i) => i.id === invoiceId)?.payments || [];
    },
  },

  accounts: {
    getAll: async (): Promise<Account[]> => {
      await delay(200);
      return mockAccounts;
    },

    getById: async (id: number): Promise<Account | null> => {
      await delay(100);
      return mockAccounts.find((a) => a.id === id) || null;
    },

    getByType: async (type: string): Promise<Account[]> => {
      await delay(200);
      return mockAccounts.filter((a) => a.type === type);
    },

    create: async (data: CreateAccountDto): Promise<Account> => {
      await delay(300);
      return addAccount({
        ...data,
        balance: 0,
        isActive: true,
      });
    },

    update: async (
      id: number,
      data: Partial<Account>,
    ): Promise<Account | null> => {
      await delay(300);
      return updateMockAccount(id, data);
    },
  },

  journalEntries: {
    getAll: async (
      filters?: JournalFilters,
    ): Promise<{ items: JournalEntry[]; total: number }> => {
      await delay(300);
      let items = [...mockJournalEntries];

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(
          (e) =>
            e.entryNumber.toLowerCase().includes(search) ||
            e.description.toLowerCase().includes(search),
        );
      }

      if (filters?.status) {
        items = items.filter((e) => e.status === filters.status);
      }

      if (filters?.journalType) {
        items = items.filter((e) => e.journalType === filters.journalType);
      }

      return { items, total: items.length };
    },

    getById: async (id: number): Promise<JournalEntry | null> => {
      await delay(200);
      return mockJournalEntries.find((e) => e.id === id) || null;
    },

    create: async (data: CreateJournalEntryDto): Promise<JournalEntry> => {
      await delay(400);
      return addJournalEntry({
        ...data,
        status: "DRAFT",
        createdBy: 1,
        lines: data.lines.map((line, idx) => ({
          id: Date.now() + idx,
          entryId: 0,
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description,
        })),
      });
    },

    update: async (
      id: number,
      data: Partial<CreateJournalEntryDto>,
    ): Promise<JournalEntry | null> => {
      await delay(400);
      return updateMockJournalEntry(
        id,
        data as unknown as Partial<JournalEntry>,
      );
    },

    post: async (id: number): Promise<JournalEntry | null> => {
      await delay(300);
      return postMockJournalEntry(id);
    },

    reverse: async (id: number): Promise<JournalEntry | null> => {
      await delay(300);
      const original = mockJournalEntries.find((e) => e.id === id);
      if (!original || original.status !== "POSTED") return null;

      return addJournalEntry({
        date: new Date().toISOString().split("T")[0],
        description: `Reversal of ${original.entryNumber}`,
        reference: original.entryNumber,
        journalType: original.journalType,
        status: "POSTED",
        createdBy: 1,
        postedAt: new Date().toISOString(),
        lines:
          original.lines?.map((line, idx) => ({
            id: Date.now() + idx,
            entryId: 0,
            accountId: line.accountId,
            debit: line.credit,
            credit: line.debit,
            description: line.description,
          })) || [],
      });
    },
  },
};
