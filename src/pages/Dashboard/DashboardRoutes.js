import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

// Lazy load dashboard components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyAuctions = lazy(() => import('./pages/MyAuctions'));
const AddAuction = lazy(() => import('./pages/AddAuction'));
const EditAuction = lazy(() => import('./pages/EditAuction'));
const Settings = lazy(() => import('./pages/Settings'));
const SMSTest = lazy(() => import('../../components/forms/SMSTest/SMSTest'));
const WonAuctions = lazy(() => import('./pages/WonAuctions'));
const Archive = lazy(() => import('./pages/Archive'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Loading component
const DashboardLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00adef]"></div>
  </div>
);

const DashboardRoutes = () => {
  return (
    <Suspense fallback={<DashboardLoader />}>
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
    </Suspense>
  );
};

export default DashboardRoutes;