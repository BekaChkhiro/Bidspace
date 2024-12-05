import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyAuctions from './pages/MyAuctions';
import AddAuction from './pages/AddAuction';
import EditAuction from './pages/EditAuction';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-auctions"
        element={
          <ProtectedRoute>
            <MyAuctions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-auction"
        element={
          <ProtectedRoute>
            <AddAuction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-auction/:id"
        element={
          <ProtectedRoute>
            <EditAuction />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default DashboardRoutes;