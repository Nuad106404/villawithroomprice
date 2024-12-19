import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation();
  const { user, isLoading, error } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user is not an admin, show access denied
  if (user.role !== 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Access Denied</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You do not have permission to access this area. This section is restricted to administrators only.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  // If user is admin, render the protected content
  return <>{children}</>;
}
