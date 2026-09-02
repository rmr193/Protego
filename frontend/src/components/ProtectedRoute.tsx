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

  const userRole = user?.role?.name || (typeof (user as any)?.role === 'string' ? (user as any).role : 'CITIZEN');

  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    // Logged in but doesn't have the required role
    // Redirect to their respective authorized dashboard
    if (userRole === 'POLICE_OFFICER') {
      return <Navigate to="/police" replace />;
    } else {
      return <Navigate to="/citizen" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
