import type {
  Employee,
  EmployeeFilters,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Attendance,
  AttendanceFilters,
  LeaveRequest,
  LeaveRequestFilters,
  CreateLeaveRequestDto,
  LeaveBalance,
} from '../types/hr';
import { mockEmployees } from '../data/mockEmployees';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const hrService = {
  employees: {
    getAll: async (filters?: EmployeeFilters): Promise<{ items: Employee[]; total: number }> => {
      await delay(300);
      let employees = [...mockEmployees];

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        employees = employees.filter(
          (e) =>
            e.firstName.toLowerCase().includes(search) ||
            e.lastName.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search)
        );
      }

      if (filters?.department) {
        employees = employees.filter((e) => e.department === filters.department);
      }

      if (filters?.status) {
        employees = employees.filter((e) => e.status === filters.status);
      }

      return { items: employees, total: employees.length };
    },

    getById: async (id: number): Promise<Employee | null> => {
      await delay(200);
      return mockEmployees.find((e) => e.id === id) || null;
    },

    create: async (data: CreateEmployeeDto): Promise<Employee> => {
      await delay(300);
      const newEmployee: Employee = {
        id: Math.max(...mockEmployees.map((e) => e.id)) + 1,
        ...data,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newEmployee;
    },

    update: async (id: number, data: UpdateEmployeeDto): Promise<Employee> => {
      await delay(300);
      const index = mockEmployees.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Employee not found');
      return { ...mockEmployees[index], ...data, updatedAt: new Date().toISOString() };
    },

    delete: async (id: number): Promise<void> => {
      await delay(200);
      return;
    },
  },

  attendance: {
    getAll: async (_filters?: AttendanceFilters): Promise<{ items: Attendance[]; total: number }> => {
      await delay(300);
      return {
        items: [
          { id: 1, employeeId: 1, date: '2026-04-15', checkIn: '09:00', checkOut: '17:00', status: 'PRESENT' },
          { id: 2, employeeId: 2, date: '2026-04-15', checkIn: '08:55', checkOut: '17:30', status: 'PRESENT' },
          { id: 3, employeeId: 3, date: '2026-04-15', checkIn: '09:10', checkOut: '17:00', status: 'LATE' },
        ],
        total: 3,
      };
    },

    clockIn: async (): Promise<Attendance> => {
      await delay(300);
      return {
        id: Math.floor(Math.random() * 1000),
        employeeId: 1,
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'PRESENT',
      };
    },

    clockOut: async (): Promise<Attendance> => {
      await delay(300);
      return {
        id: Math.floor(Math.random() * 1000),
        employeeId: 1,
        date: new Date().toISOString().split('T')[0],
        checkOut: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'PRESENT',
      };
    },
  },

  leave: {
    getAll: async (_filters?: LeaveRequestFilters): Promise<{ items: LeaveRequest[]; total: number }> => {
      await delay(300);
      return {
        items: [
          {
            id: 1,
            employeeId: 1,
            startDate: '2026-04-20',
            endDate: '2026-04-25',
            type: 'ANNUAL',
            status: 'PENDING',
            reason: 'Family vacation',
            createdAt: '2026-04-10T10:00:00Z',
            updatedAt: '2026-04-10T10:00:00Z',
          },
          {
            id: 2,
            employeeId: 2,
            startDate: '2026-04-18',
            endDate: '2026-04-19',
            type: 'SICK',
            status: 'APPROVED',
            reason: 'Doctor appointment',
            approvedBy: 1,
            approvedAt: '2026-04-12T14:00:00Z',
            createdAt: '2026-04-11T09:00:00Z',
            updatedAt: '2026-04-12T14:00:00Z',
          },
        ],
        total: 2,
      };
    },

    getById: async (id: number): Promise<LeaveRequest | null> => {
      await delay(200);
      const items = [
        {
          id: 1,
          employeeId: 1,
          startDate: '2026-04-20',
          endDate: '2026-04-25',
          type: 'ANNUAL' as const,
          status: 'PENDING' as const,
          reason: 'Family vacation',
          createdAt: '2026-04-10T10:00:00Z',
          updatedAt: '2026-04-10T10:00:00Z',
        },
      ];
      return items.find((r) => r.id === id) || null;
    },

    create: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
      await delay(300);
      return {
        id: Math.floor(Math.random() * 1000),
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    approve: async (id: number): Promise<LeaveRequest> => {
      await delay(300);
      return {
        id,
        employeeId: 1,
        startDate: '2026-04-20',
        endDate: '2026-04-25',
        type: 'ANNUAL',
        status: 'APPROVED',
        reason: 'Family vacation',
        approvedBy: 1,
        approvedAt: new Date().toISOString(),
        createdAt: '2026-04-10T10:00:00Z',
        updatedAt: new Date().toISOString(),
      };
    },

    reject: async (id: number): Promise<LeaveRequest> => {
      await delay(300);
      return {
        id,
        employeeId: 1,
        startDate: '2026-04-20',
        endDate: '2026-04-25',
        type: 'ANNUAL',
        status: 'REJECTED',
        reason: 'Family vacation',
        createdAt: '2026-04-10T10:00:00Z',
        updatedAt: new Date().toISOString(),
      };
    },

    getBalances: async (): Promise<LeaveBalance[]> => {
      await delay(200);
      return [
        { type: 'ANNUAL', totalDays: 21, usedDays: 5, remainingDays: 16 },
        { type: 'SICK', totalDays: 10, usedDays: 2, remainingDays: 8 },
        { type: 'PERSONAL', totalDays: 5, usedDays: 1, remainingDays: 4 },
      ];
    },
  },
};
