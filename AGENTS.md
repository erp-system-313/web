# ERP Frontend — AGENTS.md

## Project Identity

Full-stack ERP frontend — React 19 + TypeScript + Ant Design 6.  
Backend is Spring Boot Java at `../service/`.

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | React 19                                      |
| Language   | TypeScript                                    |
| UI Library | Ant Design 6 (`antd@^6.3.5`)                  |
| Icons      | `@ant-design/icons`                           |
| Build      | Vite 8                                        |
| HTTP       | Axios                                         |
| Forms      | react-hook-form + yup (`@hookform/resolvers`) |
| Dates      | dayjs                                         |

## Directory Layout

```
web/
├── src/
│   ├── api/
│   │   ├── client.ts        ← Axios instance (baseURL: /api) — USE THIS
│   │   ├── endpoints.ts     ← All endpoint URL constants (/v1/...)
│   │   └── index.ts
│   ├── services/            ← One service file per domain
│   │   ├── salesService.ts
│   │   ├── financeService.ts
│   │   ├── hrService.ts
│   │   ├── inventoryService.ts
│   │   ├── purchasingService.ts
│   │   ├── usersService.ts
│   │   ├── authService.ts
│   │   ├── auditLogsService.ts
│   │   ├── settingsService.ts
│   │   ├── dashboardService.ts
│   │   └── apiClient.ts     ← DEPRECATED (baseURL: /api/v1, don't use)
│   ├── types/               ← TypeScript interfaces per module
│   │   ├── finance.ts
│   │   ├── hr.ts
│   │   ├── sales.ts
│   │   ├── supplier.types.ts
│   │   ├── purchaseOrder.types.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   └── index.ts
│   ├── hooks/               ← Custom React hooks (useEntity pattern)
│   │   ├── useInvoice.ts, useInvoices.ts
│   │   ├── useEmployee.ts, useEmployees.ts
│   │   ├── useLeaveRequests.ts
│   │   ├── useAttendance.ts
│   │   ├── useUsers.ts, useAuditLogs.ts
│   │   ├── useSuppliers.ts, usePurchaseOrders.ts
│   │   ├── useProducts.ts, useCategories.ts
│   │   └── ...
│   ├── pages/               ← Page components grouped by module
│   │   ├── sales/
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── inventory/
│   │   ├── purchasing/
│   │   ├── admin/
│   │   ├── common/          (Dashboard, Profile)
│   │   └── auth/            (Login)
│   ├── components/
│   │   └── common/          ← Shared: StatusBadge, DataTable, TabPanel, etc.
│   ├── schemas/             ← yup validation schemas
│   ├── contexts/            ← AuthContext, etc.
│   ├── mocks/               ← Mock data (mirrors real API shape)
│   └── data/                ← Static/seed data
├── dist/
├── package.json
└── tsconfig.json
```

## Module Mapping

| Module     | Types File                                    | Service File                                                   | Hooks                                              | Backend Package      |
| ---------- | --------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- | -------------------- |
| Sales      | `types/sales.ts`                              | `salesService.ts`                                              | `useSalesOrder`, `useCustomer`                     | `com.erp.sales`      |
| Finance    | `types/finance.ts`                            | `financeService.ts`                                            | `useInvoice`, `useJournalEntry`, `useAccounts`     | `com.erp.finance`    |
| HR         | `types/hr.ts`                                 | `hrService.ts`                                                 | `useEmployee`, `useLeaveRequests`, `useAttendance` | `com.erp.hr`         |
| Inventory  | `product.types.ts`, `category.types.ts`       | `inventoryService.ts`                                          | `useProducts`, `useCategories`                     | `com.erp.inventory`  |
| Purchasing | `supplier.types.ts`, `purchaseOrder.types.ts` | `purchasingService.ts`                                         | `useSuppliers`, `usePurchaseOrders`                | `com.erp.purchasing` |
| Admin      | (inline in services)                          | `usersService.ts`, `auditLogsService.ts`, `settingsService.ts` | `useUsers`, `useAuditLogs`                         | `com.erp.admin`      |
| Auth       | (inline in services)                          | `authService.ts`                                               | —                                                  | `com.erp.auth`       |
| Dashboard  | (inline)                                      | `dashboardService.ts`                                          | `useDashboardStats`                                | `com.erp.admin`      |

## Critical Conventions

### API Client

- **USE** `src/api/client.ts` — baseURL is `/api`, import as `apiClient`
- **DO NOT USE** `src/services/apiClient.ts` — deprecated, baseURL is `/api/v1` (causes double `/v1/v1/`)

### Endpoints

- Always use constants from `src/api/endpoints.ts`, never hardcode URL strings
- All endpoint paths start with `/v1/` (e.g. `/v1/customers`)
- Full URL becomes: base `/api` + path `/v1/...` → `/api/v1/...`

### ID Types

- Backend uses `Long` (Java) → frontend uses **`number`**, never `string`
- This applies to all entity IDs, foreign keys, and path parameters

### Status Fields

- Backend uses Java enums → frontend uses **string literal unions**
- Example: `type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'`
- Never use `boolean` for status (e.g. `isActive` when backend has `status` enum)

### DTOs

- Use **dedicated Create/Update interfaces**, not `Partial<EntityType>`
- `Partial<Entity>` leaks `id`, `createdAt`, `updatedAt` into request payloads
- Each entity should have: `Entity`, `CreateEntityDto`, `UpdateEntityDto`

### API Response Wrapper

- Every backend endpoint returns `ApiResponse<T>`:
  ```typescript
  { success: boolean; data: T; message: string; error?: ErrorInfo }
  ```
- Always extract `.data` from the response object before using it
- Paginated responses have `data.content` (array) + `data.totalElements`

### Hook Pattern

- `useEntity(id)` — single entity fetch (returns `{ data, loading, error }`)
- `useEntities(params?)` — list with filtering/pagination (returns `{ data, loading, pagination }`)
- Mutation methods: `create`, `update`, `delete` returned alongside fetch state

### Import Order

1. React / core libraries
2. External libraries (antd, react-hook-form, axios)
3. Internal absolute (`@/types`, `@/hooks`, `@/services`)
4. Internal relative (`../../components/...`)

## Build Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # tsc -b && vite build  (type-check + production bundle)
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Common Pitfalls

### Double `/v1/v1/` URL

Old `src/services/apiClient.ts` has base `/api/v1`. If you pair it with endpoint constants starting with `/v1/`, you get `/api/v1/v1/products`. Always use `src/api/client.ts` (base `/api`).

### Missing `.data` Extraction

Services return `ApiResponse<T>`. If you pass the whole response to state, components receive `{ success, data, message }` instead of the actual entity. Always do `response.data`.

```typescript
// ❌ Wrong — categories gets the whole ApiResponse wrapper
const res = await apiClient.get(endpoints.categories.list);
setCategories(res);

// ✅ Correct — extract .data
const res = await apiClient.get(endpoints.categories.list);
setCategories(res.data);
```

### `.toFixed()` on Undefined

Backend DTOs may omit optional number fields. Calling `.toFixed(2)` on `undefined` crashes the `<Cell>` component. Always guard:

```typescript
render: (v: number) => `$${(v ?? 0).toFixed(2)}`;
// Not:  render: (v: number) => `$${v.toFixed(2)}`
```

### Field Name Drift

Backend DTOs use different names than what the frontend historically expected. Always check the actual backend DTO before adding fields:

| Frontend (old)         | Backend (correct)                 | Entity             |
| ---------------------- | --------------------------------- | ------------------ |
| `total`                | `totalAmount`                     | Invoice            |
| `balanceDue`           | `balance`                         | Invoice            |
| `createdBy`            | `createdById` (+ `createdByName`) | JournalEntry, etc. |
| `clockIn` / `clockOut` | `checkIn` / `checkOut`            | Attendance         |
| `days`                 | `totalDays`                       | LeaveRequest       |
| `approvedBy`           | `approvedById`                    | LeaveRequest       |
| `userName`             | `userEmail`                       | AuditLog           |
| `entity`               | `entityType`                      | AuditLog           |
| `timestamp`            | `createdAt`                       | AuditLog           |

### Enum Sync

Backend enums may have values not in frontend unions. Keep unions in sync:

| Enum                  | Values in Backend                                                |
| --------------------- | ---------------------------------------------------------------- |
| `EmployeeStatus`      | `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`                   |
| `AttendanceStatus`    | `PRESENT`, `ABSENT`, `LATE`, `LEAVE`, `HALF_DAY`                 |
| `LeaveType`           | `ANNUAL`, `SICK`, `PERSONAL`, `UNPAID`, `MATERNITY`, `PATERNITY` |
| `SupplierStatus`      | `ACTIVE`, `INACTIVE`                                             |
| `PurchaseOrderStatus` | `PENDING`, `APPROVED`, `RECEIVED`, `CANCELLED`                   |
| `InvoiceStatus`       | `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`                  |
| `ProductStatus`       | `ACTIVE`, `INACTIVE`, `DISCONTINUED`                             |

### Duplicate Type Definitions

`Employee` was previously defined in 3 places (`types/hr.ts`, `services/hrService.ts`, `types/models/employee.ts`) with different shapes. Keep types in `types/` only — services should import from `types/`, not redefine inline (or if inline, keep them in sync).
