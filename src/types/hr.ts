export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  parentName?: string;
  managerId?: number;
  managerName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPosition {
  id: number;
  title: string;
  departmentId?: number;
  departmentName?: string;
  description?: string;
  expectedEmployees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  departmentId?: number;
  departmentName?: string;
  position: string;
  positionId?: number;
  positionName?: string;
  hireDate: string;
  terminationDate?: string;
  salary?: number;
  status: EmployeeStatus;
  address?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: number;
  positionId?: number;
  hireDate: string;
  salary?: number;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmployeeStatus;
}

export interface EmployeeFilters {
  search?: string;
  departmentId?: number;
  status?: EmployeeStatus;
}

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "LEAVE"
  | "HALF_DAY";

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceFilters {
  employeeId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "MATERNITY"
  | "PATERNITY";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  type: LeaveType;
  status: LeaveStatus;
  reason?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDto {
  employeeId: number;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason?: string;
}

export interface LeaveRequestFilters {
  employeeId?: number;
  status?: LeaveStatus;
  type?: LeaveType;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  employeeName: string;
  type: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export type ContractType = "PERMANENT" | "INTERNSHIP" | "FIXED_TERM" | "CONTRACTOR";
export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface Contract {
  id: number;
  employeeId: number;
  employeeName: string;
  type: ContractType;
  startDate: string;
  endDate?: string;
  wage?: number;
  benefits?: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  employeeId: number;
  type: ContractType;
  startDate: string;
  endDate?: string;
  wage?: number;
  benefits?: string;
}
