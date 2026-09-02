import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('CITIZEN' | 'POLICE_OFFICER')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Not logged in, redirect to landing page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user?.role?.name && !allowedRoles.includes(user.role.name)) {
    // Logged in but doesn't have the required role
    // Redirect to their respective dashboard
    if (user.role.name === 'POLICE_OFFICER') {
      return <Navigate to="/police" replace />;
    } else {
      return <Navigate to="/citizen" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
