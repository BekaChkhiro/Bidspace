import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyAuctions from './pages/MyAuctions';
import AddAuction from './pages/AddAuction';
import EditAuction from './pages/EditAuction';
import Settings from './pages/Settings';
import SMSTest from '../../components/SMSTest/SMSTest';
import WonAuctions from './pages/won-auctions';
import Archive from './pages/archive';
import Wishlist from './pages/Wishlist';

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
        path="profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="my-auctions"
        element={
          <ProtectedRoute>
            <MyAuctions />
          </ProtectedRoute>
        }
      />
      <Route
        path="won-auctions"
        element={
          <ProtectedRoute>
            <WonAuctions />
          </ProtectedRoute>
        }
      />
      <Route
        path="add-auction"
        element={
          <ProtectedRoute>
            <AddAuction />
          </ProtectedRoute>
        }
      />
      <Route
        path="edit-auction/:id"
        element={
          <ProtectedRoute>
            <EditAuction />
          </ProtectedRoute>
        }
      />
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="sms-test"
        element={
          <ProtectedRoute>
            <SMSTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="archive"
        element={
          <ProtectedRoute>
            <Archive />
          </ProtectedRoute>
        }
      />
      <Route
        path="wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default DashboardRoutes;