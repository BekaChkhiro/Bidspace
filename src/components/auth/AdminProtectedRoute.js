import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('AdminProtectedRoute - Auth State:', { isAuthenticated, user, loading });

  if (loading) {
    console.log('AdminProtectedRoute - Loading...');
    return null;
  }

  if (!isAuthenticated) {
    console.log('AdminProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Check if user is a WordPress administrator
  console.log('AdminProtectedRoute - User roles:', user?.roles);
  if (!user?.roles?.includes('administrator')) {
    console.log('AdminProtectedRoute - User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  console.log('AdminProtectedRoute - User is admin, allowing access');
  return children;
};

export default AdminProtectedRoute;
