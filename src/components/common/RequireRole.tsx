import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

interface RequireRoleProps {
  roles: string[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase();
  const hasRole = roles.some((r) => r.toLowerCase() === userRole);

  if (!hasRole) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
