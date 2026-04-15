import { BrowserRouter, Link } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px' }}>
        <Link to="/hr/employees">Employees</Link>
        <Link to="/hr/attendance">Attendance</Link>
        <Link to="/hr/leave">Leave Requests</Link>
      </nav>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
