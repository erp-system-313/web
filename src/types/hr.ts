export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate: string;
  salary?: number;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate: string;
  salary?: number;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmployeeStatus;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export interface Attendance {
  id: number;
  employeeId: number;
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

export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: LeaveStatus;
  reason?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDto {
  employeeId?: number;
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
  type: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
