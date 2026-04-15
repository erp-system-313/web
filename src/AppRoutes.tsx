import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { EmployeesList } from './pages/hr/EmployeesList/EmployeesList';
import { EmployeeDetails } from './pages/hr/EmployeeDetails/EmployeeDetails';
import AttendancePage from './pages/hr/Attendance/Attendance';
import LeaveRequestsPage from './pages/hr/LeaveRequests/LeaveRequests';
import LoginPage from './pages/auth/Login/Login';
import DashboardPage from './pages/common/Dashboard/Dashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  
  if (!authContext || authContext.isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!authContext.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
      <Route path="/hr/employees/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/hr/leave" element={<ProtectedRoute><LeaveRequestsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
