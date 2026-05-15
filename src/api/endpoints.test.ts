import { endpoints } from "./endpoints";

describe("endpoints", () => {
  it("has all module sections", () => {
    const sections = [
      "customers",
      "salesOrders",
      "products",
      "inventory",
      "categories",
      "suppliers",
      "purchaseOrders",
      "invoices",
      "journal",
      "accounts",
      "employees",
      "attendance",
      "leave",
      "users",
      "crm",
      "support",
      "dashboard",
      "roles",
      "permissions",
    ];
    for (const section of sections) {
      expect(endpoints).toHaveProperty(section);
    }
  });

  it("generates correct dynamic paths", () => {
    expect(endpoints.customers.getById(5)).toBe("/v1/customers/5");
    expect(endpoints.salesOrders.getById(42)).toBe("/v1/sales-orders/42");
    expect(endpoints.products.lowStock).toBe("/v1/products/low-stock");
    expect(endpoints.support.addComment(1)).toBe(
      "/v1/support/tickets/1/comments",
    );
  });

  it("invoices has payment and PDF paths", () => {
    expect(endpoints.invoices.getPdf(3)).toBe("/v1/invoices/3/pdf");
    expect(endpoints.invoices.addPayment(3)).toBe("/v1/invoices/3/payments");
  });

  it("leave has approve/reject paths", () => {
    expect(endpoints.leave.approve(7)).toBe("/v1/leave-requests/7/approve");
    expect(endpoints.leave.reject(7)).toBe("/v1/leave-requests/7/reject");
  });
});
