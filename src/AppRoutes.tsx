import { Routes, Route } from 'react-router-dom';
import { EmployeesList } from '../pages/hr/EmployeesList';
import { EmployeeDetails } from '../pages/hr/EmployeeDetails';
import { Attendance } from '../pages/hr/Attendance';
import { LeaveRequests } from '../pages/hr/LeaveRequests';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/hr/employees" element={<EmployeesList />} />
      <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
      <Route path="/hr/attendance" element={<Attendance />} />
      <Route path="/hr/leave" element={<LeaveRequests />} />
    </Routes>
  );
};

export default AppRoutes;
