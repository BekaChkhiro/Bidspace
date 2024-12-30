import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminProtectedRoute from '../../components/auth/AdminProtectedRoute';
import AdminDashboardLayout from './components/layout/AdminDashboardLayout';
import Dashboard from './pages/Dashboard';
import AuctionManagement from './pages/AuctionManagement';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

const AdminDashboardRoutes = () => {
  return (
    <AdminProtectedRoute>
      <AdminDashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="auctions" element={<AuctionManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </AdminDashboardLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDashboardRoutes;
