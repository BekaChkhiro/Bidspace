import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminProtectedRoute from '../../components/auth/AdminProtectedRoute';
import AdminDashboardLayout from './components/layout/AdminDashboardLayout';

// Lazy load admin pages
const Overview = lazy(() => import('./pages/Overview'));
const Auctions = lazy(() => import('./pages/Auctions'));
const Users = lazy(() => import('./pages/Users'));
const Payments = lazy(() => import('./pages/Payments'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const AdminDashboardRoutes = () => {
  return (
    <AdminProtectedRoute>
      <AdminDashboardLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </AdminDashboardLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDashboardRoutes;
