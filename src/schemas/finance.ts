import * as yup from "yup";

export const editAccountSchema = yup.object({
  name: yup.string().required("Account name is required"),
  type: yup
    .string()
    .oneOf(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"])
    .required("Account type is required"),
});

export type EditAccountFormData = yup.InferType<typeof editAccountSchema>;

export const addAccountSchema = yup.object({
  code: yup.string().required("Account code is required"),
  name: yup.string().required("Account name is required"),
  type: yup
    .string()
    .oneOf(["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"])
    .required("Account type is required"),
  parentId: yup.number().optional(),
});

export type AddAccountFormData = yup.InferType<typeof addAccountSchema>;

export const recordPaymentSchema = yup.object({
  amount: yup
    .number()
    .required("Amount is required")
    .min(0.01, "Amount must be greater than 0"),
  paymentDate: yup.string().required("Payment date is required"),
  method: yup
    .string()
    .oneOf(["CASH", "CARD", "BANK_TRANSFER", "CHEQUE"])
    .required("Payment method is required"),
  reference: yup.string().optional(),
  notes: yup.string().optional(),
});

export type RecordPaymentFormData = yup.InferType<typeof recordPaymentSchema>;

export const invoiceLineSchema = yup.object({
  productId: yup.number().optional(),
  quantity: yup.number().required("Quantity is required").min(1, "Min 1"),
  unitPrice: yup.number().required("Unit price is required").min(0, "Min 0"),
  taxRate: yup.number().optional(),
});

export const invoiceFormSchema = yup.object({
  customerId: yup.number().required("Customer is required"),
  invoiceDate: yup.string().required("Invoice date is required"),
  dueDate: yup.string().required("Due date is required"),
  lines: yup
    .array()
    .of(invoiceLineSchema)
    .min(1, "At least one line item is required"),
});

export type InvoiceFormData = yup.InferType<typeof invoiceFormSchema>;

export const journalEntryLineSchema = yup.object({
  accountId: yup.number().required("Account is required"),
  debit: yup.number().required("Debit is required").min(0, "Min 0"),
  credit: yup.number().required("Credit is required").min(0, "Min 0"),
  description: yup.string().optional(),
});

export const journalEntryFormSchema = yup
  .object({
    date: yup.string().required("Date is required"),
    description: yup.string().required("Description is required"),
    reference: yup.string().optional(),
    journalType: yup
      .string()
      .oneOf(["SALES", "PURCHASE", "ADJUSTMENT", "MISC"])
      .required("Journal type is required"),
    lines: yup
      .array()
      .of(journalEntryLineSchema)
      .min(2, "At least two lines are required for double-entry"),
  })
  .test("balanced", "Total debits must equal total credits", (value) => {
    if (!value.lines) return true;
    const totalDebits = value.lines.reduce(
      (sum, line) => sum + (line.debit || 0),
      0,
    );
    const totalCredits = value.lines.reduce(
      (sum, line) => sum + (line.credit || 0),
      0,
    );
    return Math.abs(totalDebits - totalCredits) < 0.01;
  });

export type JournalEntryFormData = yup.InferType<typeof journalEntryFormSchema>;
