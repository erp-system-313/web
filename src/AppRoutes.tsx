import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { EmployeesList } from './pages/hr/EmployeesList/EmployeesList';
import { EmployeeDetails } from './pages/hr/EmployeeDetails/EmployeeDetails';
import AttendancePage from './pages/hr/Attendance/Attendance';
import LeaveRequestsPage from './pages/hr/LeaveRequests/LeaveRequests';
import LoginPage from './pages/auth/Login/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const DashboardPage = () => <div style={{ padding: 24 }}><h1>Dashboard</h1><p>Welcome to the ERP Dashboard</p></div>;

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
