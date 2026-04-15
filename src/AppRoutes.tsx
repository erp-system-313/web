import { Routes, Route } from 'react-router-dom';
import { EmployeesList } from './pages/hr/EmployeesList/EmployeesList';
import { EmployeeDetails } from './pages/hr/EmployeeDetails/EmployeeDetails';
import AttendancePage from './pages/hr/Attendance/Attendance';
import LeaveRequestsPage from './pages/hr/LeaveRequests/LeaveRequests';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/hr/employees" element={<EmployeesList />} />
      <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
      <Route path="/hr/attendance" element={<AttendancePage />} />
      <Route path="/hr/leave" element={<LeaveRequestsPage />} />
    </Routes>
  );
};

export default AppRoutes;
