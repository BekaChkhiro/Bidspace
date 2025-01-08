import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardLayout from './components/layout/AdminDashboardLayout';
import Overview from './pages/Overview';
import Auctions from './pages/Auctions';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const AdminRoutes = () => {
  return (
    <AdminDashboardLayout>
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
    </AdminDashboardLayout>
  );
};

export default AdminRoutes;
