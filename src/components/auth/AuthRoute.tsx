import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
}

export function AuthRoute({ children }: AuthRouteProps) {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const from = location.state?.from || '/';

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is already logged in, redirect based on role and previous location
  if (user) {
    if (user.role === 'admin') {
      // If they were trying to access a specific admin page, send them there
      if (from.startsWith('/admin')) {
        return <Navigate to={from} replace />;
      }
      // Otherwise, send them to the admin dashboard
      return <Navigate to="/admin/dashboard" replace />;
    }
    // For regular users, send them to the home page
    return <Navigate to="/" replace />;
  }

  // If user is not logged in, show the login/register form
  return <>{children}</>;
}
