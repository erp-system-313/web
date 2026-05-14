# Consistency Audit

## Overview

Cross-module audit of the ERP frontend (`src/`) to enforce uniform patterns across all modules. Pages, services, hooks, and types that do the same thing should look the same regardless of which module they belong to.

## Related Issues

| Issue  | Title                   | Relationship                                                |
| ------ | ----------------------- | ----------------------------------------------------------- |
| #27    | MVP + Code Consistency  | Superseded by this issue. Close when this is resolved.      |
| #40    | Fix Orders module       | Partially addressed by Phase 1. Verify on main.             |
| #41-54 | Various fixes (401-454) | Most are already fixed on `main`. Close after verification. |

## Conventions Source

See `AGENTS.md` for the canonical project conventions. This issue enforces those conventions across all modules.

## Linting

Current ESLint config (`eslint.config.js`) is minimal — only `@eslint/js:recommended`, `typescript-eslint:recommended`, and `react-hooks:recommended`. No custom rules for:

- **Import ordering** — no `import/order` or `simple-import-sort` plugin
- **Naming conventions** — no `@typescript-eslint/naming-convention` rules
- **Export style** — no rule enforcing named vs default exports
- **File structure** — no rule enforcing folder-per-page pattern

**Recommended:** Add `eslint-plugin-simple-import-sort` and `@typescript-eslint/naming-convention` to catch these automatically.

## Current Organizational State

Pages use **3 different organizational patterns**:

| Pattern                  | Modules                                     | Subfolder barrel | Domain barrel |
| ------------------------ | ------------------------------------------- | :--------------: | :-----------: |
| **A: Folder + barrel**   | `finance/`, `sales/`                        |      ✅ Yes      |    ✅ Yes     |
| **B: Folder, no barrel** | `crm/`, `hr/`, `admin/`, `common/`, `auth/` |      ❌ No       |     ❌ No     |
| **C: Flat files**        | `inventory/`, `purchasing/`                 |    N/A (flat)    |     ❌ No     |

---

## Phase 1 — Bugs (fix now)

### C1: Product/Category `id` typed as string

**Problem:** `Product.id` and `Category.id` are `string`; every other entity ID is `number`.

**Files:**

- `src/types/product.types.ts`
- `src/types/category.types.ts`

**Fix:** Change `id: string` to `id: number` and update all consumers.

**Consumers to update:**

- `src/services/inventoryService.ts`
- `src/hooks/useCategories.ts`
- `src/pages/inventory/ProductListPage.tsx`
- `src/pages/inventory/ProductDetailsPage.tsx`
- `src/pages/inventory/CreateProductPage.tsx`
- `src/pages/inventory/EditProductPage.tsx`
- `src/pages/inventory/CategoryListPage.tsx`

---

### C2: `salesService.products.search` wrong return type

**Problem:** Returns `Promise<Customer[]>` instead of `Promise<Product[]>`.

**File:** `src/services/salesService.ts:231`

**Fix:** Change return type from `Customer[]` to `Product[]`, generic from `PageResponse<Customer>` to `PageResponse<Product>`.

---

### C3: `useLeads.fetchLeads` empty useCallback deps

**Problem:** `fetchLeads` has empty dependency array `[]` but reads `filters` from closure. Filter changes never trigger a re-fetch.

**File:** `src/hooks/useCRM.ts:18`

**Fix:** Add filter properties to deps array.

---

### C4: Missing `error` state on 7 hooks

**Problem:** Hooks that lack an `error` state variable silently swallow failures. Consumers cannot detect or display errors.

**Affected hooks:**

| Hook                | Current behavior             | Fix                                           |
| ------------------- | ---------------------------- | --------------------------------------------- |
| `useLeads`          | Silent catch, resets to `[]` | Add `error` state, store message              |
| `useLead`           | Silent catch, sets `null`    | Add `error` state, store message              |
| `usePipelineStages` | Silent catch, resets to `[]` | Add `error` state, store message              |
| `useCRMDashboard`   | Silent catch, sets `null`    | Add `error` state, store message              |
| `useCategories`     | Toast-only (`message.error`) | Add `error` state, remove or supplement toast |
| `usePurchaseOrders` | Toast-only (`message.error`) | Add `error` state, remove or supplement toast |
| `useSuppliers`      | Toast-only (`message.error`) | Add `error` state, remove or supplement toast |

**Pattern to follow** (from `useAttendance.ts`):

```typescript
const [error, setError] = useState<string | null>(null);

try {
  // ... fetch
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to ...");
} finally {
  setLoading(false);
}
```

---

### C5: CRM hooks use `.then/.catch` instead of async/await

**Files:**

- `src/hooks/useCRM.ts` — `useLead`, `useCRMDashboard`

**Fix:** Convert to async/await with try/catch matching the rest of the codebase.

**Current (inconsistent):**

```typescript
useEffect(() => {
  if (!id) return;
  setLoading(true);
  crmService
    .getLead(id)
    .then(setLead)
    .catch(() => setLead(null))
    .finally(() => setLoading(false));
}, [id]);
```

**Target (consistent):**

```typescript
useEffect(() => {
  if (!id) return;
  setLoading(true);
  try {
    const data = await crmService.getLead(id);
    setLead(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch lead");
  } finally {
    setLoading(false);
  }
}, [id]);
```

---

## Phase 2 — Structure (one-time refactor)

### S1: Migrate inventory + purchasing from flat files to folder-per-page

**Current (flat):**

```
src/pages/inventory/ProductListPage.tsx
src/pages/inventory/ProductDetailsPage.tsx
src/pages/inventory/CreateProductPage.tsx
src/pages/inventory/EditProductPage.tsx
src/pages/inventory/CategoryListPage.tsx
src/pages/purchasing/SupplierListPage.tsx
src/pages/purchasing/SupplierDetailsPage.tsx
src/pages/purchasing/PurchaseOrderListPage.tsx
src/pages/purchasing/CreatePurchaseOrderPage.tsx
```

**Target (folders):**

```
src/pages/inventory/ProductList/ProductList.tsx            + ProductList.module.css + index.ts
src/pages/inventory/ProductDetails/ProductDetails.tsx      + ProductDetails.module.css + index.ts
src/pages/inventory/ProductForm/ProductForm.tsx             + index.ts (shared by Create + Edit)
src/pages/inventory/CategoryList/CategoryList.tsx           + CategoryList.module.css + index.ts
src/pages/purchasing/SupplierList/SupplierList.tsx          + index.ts
src/pages/purchasing/SupplierDetails/SupplierDetails.tsx    + index.ts
src/pages/purchasing/PurchaseOrderList/PurchaseOrderList.tsx + index.ts
src/pages/purchasing/PurchaseOrderForm/PurchaseOrderForm.tsx + index.ts
```

**Steps per page:**

1. Create folder matching component name
2. Move `.tsx` + `.module.css` into folder
3. Create `index.ts` with `export { Component } from "./Component"` + `export { default } from "./Component"`
4. Update all import paths referencing the old location
5. Update `AppRoutes.tsx` imports

---

### S2: Add missing barrel exports

#### Subfolder-level `index.ts`

Every page subfolder should have an `index.ts` following this pattern (used by `finance/` and `sales/`):

```typescript
export { ComponentName } from "./ComponentName";
export { default } from "./ComponentName";
```

**Missing from:**

- `crm/Dashboard/`
- `crm/LeadsList/`
- `crm/Pipeline/`
- `crm/LeadDetails/`
- `hr/EmployeesList/`
- `hr/EmployeeDetails/`
- `hr/Attendance/`
- `hr/LeaveRequests/`
- `admin/Users/`
- `admin/AuditLogs/`
- `admin/Settings/`
- `common/Dashboard/`
- `common/Profile/`
- `auth/Login/`

#### Domain-level `index.ts`

Every page domain folder should have an `index.ts` re-exporting all sub-pages (following `finance/` and `sales/` pattern):

```typescript
export { LeadsList } from "./LeadsList";
export { LeadDetails } from "./LeadDetails";
export { Pipeline } from "./Pipeline";
export { CRMDashboard } from "./Dashboard";
```

**Missing from:**

- `src/pages/crm/`
- `src/pages/hr/`
- `src/pages/admin/`
- `src/pages/common/`
- `src/pages/auth/`
- `src/pages/inventory/`
- `src/pages/purchasing/`

#### Service-level `index.ts`

**Missing:** `src/services/index.ts` should re-export all services.

---

### S3: Fix `types/index.ts` barrel

**Current (incomplete):**

```typescript
export * from "./product.types";
export * from "./category.types";
export * from "./supplier.types";
export * from "./purchaseOrder.types";
```

**Target (complete):**

```typescript
export * from "./product.types";
export * from "./category.types";
export * from "./supplier.types";
export * from "./purchaseOrder.types";
export * from "./crm";
export * from "./finance";
export * from "./hr";
export * from "./sales";
```

---

### S4: Standardize type file naming

**Problem:** Half use `.types.ts` suffix, half use bare `.ts`.

`.types.ts` suffix (Inventory/Purchasing domain):

- `product.types.ts`
- `category.types.ts`
- `supplier.types.ts`
- `purchaseOrder.types.ts`

Bare `.ts` (CRM, Finance, HR, Sales domain):

- `crm.ts`
- `finance.ts`
- `hr.ts`
- `sales.ts`

**Decision needed:** Choose one convention. Recommend `.ts` (shorter, matches page/service naming).

---

## Phase 3 — API Layer (services)

### A1: Standardize API client alias

**Problem:** 4 services use `apiClient` directly, 7 alias as `api`.

| Style                         | Services                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `import { apiClient }`        | `crmService`, `dashboardService`, `financeService`, `salesService`                                                         |
| `import { apiClient as api }` | `authService`, `hrService`, `inventoryService`, `purchasingService`, `settingsService`, `usersService`, `auditLogsService` |

**Decision needed:** Pick one. Recommend `apiClient` (self-documenting, no alias needed).

---

### A2: Migrate 5 services to centralized `endpoints` object

**Problem:** `authService`, `hrService`, `settingsService`, `usersService`, `auditLogsService` hardcode path strings instead of using the centralized `endpoints` object.

**Current (inline):**

```typescript
const response = await api.post("/v1/auth/login", credentials);
```

**Target (via endpoints):**

```typescript
const response = await apiClient.post(endpoints.auth.login, credentials);
```

The centralized `endpoints.ts` file already defines endpoints for all modules. These 5 services just need to be updated to reference it.

**Files to update:**

- `src/services/authService.ts` — endpoints `auth.login`, `auth.refresh`, `auth.logout`
- `src/services/hrService.ts` — endpoints `employees.*`, `attendance.*`, `leave.*`
- `src/services/settingsService.ts` — endpoints `settings.*`
- `src/services/usersService.ts` — endpoints `users.*`
- `src/services/auditLogsService.ts` — endpoints `auditLogs.*`

**Note:** `endpoints.ts` may need new sections added for auth and settings if they don't exist yet.

---

### A3: Unify error handling

**Problem:** Three error handling strategies coexist:

| Strategy            | Services                                                                               | Behavior                                                           |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Throw**           | `dashboardService`, `hrService`, `settingsService`, `usersService`, `auditLogsService` | `try/catch` → `throw new Error(handleApiError(error))`             |
| **Return object**   | `authService`                                                                          | `try/catch` → returns `{ success: false, error: ... }`             |
| **Mixed / Swallow** | `financeService`, `salesService`                                                       | Some methods `console.error` + return null/[], others no try/catch |
| **No handling**     | `crmService`, `inventoryService`, `purchasingService`                                  | No try/catch, errors propagate                                     |

**Decision needed:** Recommend **throw pattern** (used by 5 services and the most defensive):

```typescript
try {
  const response = await apiClient.get(...);
  return response.data.data;
} catch (error) {
  throw new Error(handleApiError(error));
}
```

---

### A4: Extract shared API response types

**Problem:** `ApiResponse<T>` and `PageResponse<T>` are defined identically in both `financeService.ts` and `salesService.ts`.

**Fix:** Extract to `src/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

Then import in all services:

```typescript
import type { ApiResponse, PageResponse } from "../types/api";
```

---

### A5: Normalize pagination return shape

**Problem:** Services return different pagination shapes:

| Service             | Return shape                                                    |
| ------------------- | --------------------------------------------------------------- |
| `financeService`    | `{ items: T[]; total: number }`                                 |
| `salesService`      | `{ items: T[]; total: number; page: number; pageSize: number }` |
| `crmService`        | `{ data: T[]; total: number }`                                  |
| `inventoryService`  | `{ data: T[]; total: number }`                                  |
| `purchasingService` | `{ data: T[]; total: number }`                                  |
| `hrService`         | `{ content: T[]; totalElements: number }`                       |
| `usersService`      | `{ content: T[]; totalElements: number }`                       |
| `auditLogsService`  | `{ content: T[]; totalElements: number }`                       |

**Decision needed:** Standardize on one shape. Recommend `{ items: T[]; total: number }` (used by finance/sales, shortest, no unnecessary metadata).

---

### A6: Unified service export style

**Problem:** 8 services use `export default`, 3 use named export only.

| Style             | Services                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `export default`  | `auditLogsService`, `settingsService`, `inventoryService`, `crmService`, `hrService`, `usersService`, `dashboardService`, `purchasingService` |
| Named export only | `authService`, `financeService`, `salesService` (also define `ApiResponse`/`PageResponse` locally)                                            |

**Decision needed:** Pick one. Recommend **named export only** (`export const financeService = { ... }` without `export default financeService`) to match how pages and components export.

### A7: Remove dead `src/services/apiClient.ts`

**Problem:** This file exists but no service imports it. It defines an axios instance at `/api/v1` (different from the real one at `/api`) and re-exports from `../api/client` as a fallback.

**Fix:** Delete the file after confirming no imports reference it.

---

### A8: Move inline type definitions to `src/types/`

**Problem:** 6 services define types inline instead of in the centralized `src/types/` directory:

| Service               | Types defined inline                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `authService.ts`      | `LoginRequest`, `AuthUser`, `LoginResponse`                                  |
| `dashboardService.ts` | `DashboardStats`, `BackendStats`                                             |
| `hrService.ts`        | `CreateEmployeeRequest`, `UpdateEmployeeRequest` (some are in `types/hr.ts`) |
| `settingsService.ts`  | `CompanySettings`                                                            |
| `usersService.ts`     | `User`, `CreateUserDto`, `UpdateUserDto`, `UserFilters`, `UsersResponse`     |
| `auditLogsService.ts` | `AuditLog`, `AuditLogFilters`, `AuditLogsResponse`                           |

**Fix:** Move each to the appropriate `src/types/<module>.ts` file and import back in the service.

---

## Phase 4 — Hooks (hook layer consistency)

### H1: Standardize return data field to `data`

**Problem:** 10 hooks use `data` as the return field name, 7 use domain-specific names.

| Convention                 | Hooks                                                                                                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                     | `useAttendance`, `useAuditLogs`, `useCustomer`, `useEmployees`, `useInvoices`, `useJournalEntries`, `useLeaveRequests`, `useLeaveBalances`, `useUsers`, `useUser` |
| `leads` / `lead`           | `useLeads`, `useLead`                                                                                                                                             |
| `categories`               | `useCategories`                                                                                                                                                   |
| `orders`                   | `usePurchaseOrders`                                                                                                                                               |
| `suppliers`                | `useSuppliers`                                                                                                                                                    |
| `stages` / `opportunities` | `usePipelineStages`                                                                                                                                               |
| `stats`                    | `useCRMDashboard`                                                                                                                                                 |

**Fix:** Rename all domain-specific names to `data`. This enables generic table components that work with any hook.

---

### H2: Standardize refetch naming to `refetch`

**Problem:**

| Name              | Hooks                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refetch`         | `useAttendance`, `useAuditLogs`, `useCustomer`, `useEmployees`, `useInvoices`, `useJournalEntries`, `useLeaveRequests`, `useLeaveBalances`, `useUsers`, `useUser` |
| `fetchLeads`      | `useLeads`                                                                                                                                                        |
| `fetchCategories` | `useCategories`                                                                                                                                                   |
| `fetchOrders`     | `usePurchaseOrders`                                                                                                                                               |
| `fetchSuppliers`  | `useSuppliers`                                                                                                                                                    |
| `refresh`         | `usePipelineStages`                                                                                                                                               |

**Fix:** Rename all to `refetch`.

---

### H3: Fix loading initialization

**Problem:** Hooks that auto-fetch on mount but initialize `loading: false` have a brief render cycle where `loading === false` even though the fetch hasn't completed.

**Wrong:**

```typescript
const [loading, setLoading] = useState(false);
useEffect(() => {
  fetchData();
}, []);
```

**Right:**

```typescript
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetchData();
}, []);
```

**Affected hooks:** `useLeads`, `useLead`, `usePipelineStages`, `useCRMDashboard`, `useCategories`, `usePurchaseOrders`, `useSuppliers`

---

### H4: Add try/catch to mutation functions

**Problem:** Mutation functions in several hooks lack error handling. Errors become unhandled promise rejections.

**Affected:**

| Hook           | Functions missing try/catch                          |
| -------------- | ---------------------------------------------------- |
| `useLeads`     | `createLead`                                         |
| `useEmployees` | `createEmployee`, `updateEmployee`, `deleteEmployee` |

**Fix:** Wrap in try/catch, set error state, re-throw or return error.

---

### H5: Add null/undefined fallbacks

**Problem:** Most hooks access `response.content` / `response.data` / `response.items` without null fallbacks. If the backend returns `undefined`, the consumer crashes on `.map()`.

**Affected:** Every hook except `useAttendance`, `useLeaveRequests`, `useLeaveBalances`.

**Fix:**

```typescript
// Instead of:
setData(response.content);

// Use:
setData(response.content ?? []);
setTotal(response.totalElements ?? 0);
```

---

## Phase 5 — Cosmetic (naming & imports)

### N1: Fix component name / filename mismatches

| File                            | Component name   | Should be                         |
| ------------------------------- | ---------------- | --------------------------------- |
| `hr/Attendance/Attendance.tsx`  | `AttendancePage` | `Attendance`                      |
| `admin/Users/Users.tsx`         | `UsersListPage`  | `Users`                           |
| `admin/AuditLogs/AuditLogs.tsx` | `AuditLogsPage`  | `AuditLogs`                       |
| `admin/Settings/Settings.tsx`   | `SettingsPage`   | `Settings`                        |
| `common/Profile/Profile.tsx`    | `ProfilePage`    | `Profile`                         |
| `auth/Login/Login.tsx`          | `LoginPage`      | `Login`                           |
| `crm/Dashboard/Dashboard.tsx`   | `CRMDashboard`   | `Dashboard` (namespace in barrel) |

**OR** (alternative): Rename the files to match the component names.

---

### N2: Add missing `import React`

**Files missing `import React` (uses JSX without it):**

- `crm/Dashboard/Dashboard.tsx`
- `crm/Pipeline/Pipeline.tsx`
- `admin/Users/Users.tsx`
- `hr/LeaveRequests/LeaveRequests.tsx`

**Note:** React 17+ JSX transform may not require this, but for consistency with the rest of the codebase (which does import React), add the import.

---

### N3: Enforce consistent import ordering

**Standard pattern (from `finance/` and `sales/`):**

```
1. React                    import React, { useState } from "react";
2. Router                   import { useNavigate } from "react-router-dom";
3. Third-party libs         import { Button, Card } from "antd";
4. Icons                    import { PlusOutlined } from "@ant-design/icons";
5. Local components         import { DataTable } from "../../../components/common";
6. Local hooks              import { useInvoices } from "../../../hooks";
7. Types                    import type { Invoice } from "../../../types/finance";
8. Styles (last)            import styles from "./X.module.css";
```

**Files to fix:** All pages in `crm/`, `hr/`, `admin/`, `auth/`, `inventory/`, `purchasing/`.

---

## Execution Plan

```
Phase 1 ─ Bugs (5 items)
  [ ] C1  Product/Category id string→number
  [ ] C2  salesService.products.search return type
  [ ] C3  useLeads useCallback deps
  [ ] C4  Add error state to 7 hooks
  [ ] C5  CRM hooks → async/await

Phase 2 ─ Structure (4 items)
  [ ] S1  inventory + purchasing flat→folder
  [ ] S2  Add barrel exports (all missing index.ts)
  [ ] S3  Fix types/index.ts barrel
  [ ] S4  Standardize type file naming

Phase 3 ─ API Layer (8 items)
  [ ] A1  Standardize apiClient alias
  [ ] A2  Migrate 5 services to endpoints object
  [ ] A3  Unify error handling to throw pattern
  [ ] A4  Extract ApiResponse/PageResponse to shared
  [ ] A5  Normalize pagination return shape
  [ ] A6  Unified service export style
  [ ] A7  Remove dead apiClient.ts
  [ ] A8  Move inline types to types/

Phase 4 ─ Hooks (5 items)
  [ ] H1  Standardize return data field to `data`
  [ ] H2  Standardize refetch to `refetch`
  [ ] H3  Fix loading init values
  [ ] H4  Add try/catch to mutation functions
  [ ] H5  Add null/undefined fallbacks

Phase 5 ─ Polish (3 items)
  [ ] N1  Fix component name mismatches
  [ ] N2  Add missing React imports
  [ ] N3  Enforce consistent import order
```

---

## Definition of Done

This issue is complete when:

1. **No flat files** — every page in `inventory/` and `purchasing/` lives in its own folder with `index.ts`
2. **Every subfolder has a barrel** — all page folders export via `index.ts`
3. **Every domain has a barrel** — all page domains have `index.ts` re-exporting sub-pages
4. **Services barrel** — `src/services/index.ts` re-exports all services
5. **Types barrel** — `src/types/index.ts` re-exports all 9 type files
6. **All services use `endpoints` object** — no hardcoded path strings
7. **All services use same error handling** — throw pattern with `handleApiError`
8. **All hooks return `{ data, loading, error, total, refetch }`** — no domain-specific names
9. **All hooks initialize `loading: true`** — no loading flash on auto-fetch
10. **All hooks have `error` state** — no silent failures
11. **All IDs are `number`** — no `string` IDs in Product/Category
12. **All component names match filenames** — no `Page` suffix mismatches
13. **Dead code removed** — `src/services/apiClient.ts` deleted
14. **`ApiResponse<T>` / `PageResponse<T>` shared** — extracted to `src/types/api.ts`
15. **TypeScript compiles with 0 errors**
16. **Build passes with 0 warnings**

---

## Appendix: Full File Inventory

### Pages (28 files)

```
admin/
  AuditLogs/AuditLogs.tsx
  Settings/Settings.tsx
  Users/Users.tsx
auth/
  Login/Login.tsx
common/
  Dashboard/Dashboard.tsx
  Profile/Profile.tsx
crm/
  Dashboard/Dashboard.tsx
  LeadDetails/LeadDetails.tsx
  LeadsList/LeadsList.tsx
  Pipeline/Pipeline.tsx
finance/
  ChartOfAccounts/ChartOfAccounts.tsx
  InvoiceDetails/InvoiceDetails.tsx
  InvoiceForm/InvoiceForm.tsx
  InvoicesList/InvoicesList.tsx
  JournalEntries/JournalEntries.tsx
  JournalEntryForm/JournalEntryForm.tsx
hr/
  Attendance/Attendance.tsx
  EmployeeDetails/EmployeeDetails.tsx
  EmployeesList/EmployeesList.tsx
  LeaveRequests/LeaveRequests.tsx
inventory/
  CategoryListPage.tsx
  CreateProductPage.tsx
  EditProductPage.tsx
  ProductDetailsPage.tsx
  ProductListPage.tsx
projects/
  ProjectDetail/ProjectDetail.tsx
  ProjectList/ProjectList.tsx
purchasing/
  CreatePurchaseOrderPage.tsx
  PurchaseOrderListPage.tsx
  SupplierDetailsPage.tsx
  SupplierListPage.tsx
sales/
  CustomerDetails/CustomerDetails.tsx
  CustomersList/CustomersList.tsx
  SalesOrderDetails/SalesOrderDetails.tsx
  SalesOrderForm/SalesOrderForm.tsx
  SalesOrdersList/SalesOrdersList.tsx
```

### Services (11 files)

```
services/
  apiClient.ts          ← DEAD - not imported by anything
  auditLogsService.ts
  authService.ts
  crmService.ts
  dashboardService.ts
  financeService.ts
  hrService.ts
  inventoryService.ts
  projectService.ts
  purchasingService.ts
  salesService.ts
  settingsService.ts
  usersService.ts
```

### Hooks (12 files)

```
hooks/
  useAttendance.ts
  useAuditLogs.ts
  useCRM.ts
  useCategories.ts
  useCustomer.ts
  useEmployees.ts
  useInvoices.ts
  useJournalEntries.ts
  useLeaveRequests.ts
  useProjects.ts
  usePurchaseOrders.ts
  useSuppliers.ts
  useUsers.ts
```

### Types (9 files)

```
types/
  category.types.ts
  crm.ts
  finance.ts
  hr.ts
  index.ts              ← INCOMPLETE - only 4 of 9 re-exported
  product.types.ts
  purchaseOrder.types.ts
  sales.ts
  supplier.types.ts
```
