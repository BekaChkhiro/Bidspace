import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from './Dashboard';
import Profile from './Profile';
import MyAuctions from './MyAuctions';
import AddAuction from './AddAuction';
import EditAuction from './EditAuction';

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
