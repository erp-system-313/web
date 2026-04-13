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
