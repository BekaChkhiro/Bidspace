import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../../Dashboard/components/common/SearchBar';
import UserProfile from '../../../Dashboard/components/profile/UserProfile';

const AdminDashboardLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#F9F9F9]">
      {/* Top Header */}
      <div className="w-full p-6 border-b border-[#E5E5E5] bg-white flex justify-end items-center gap-6">
        <SearchBar />
        <UserProfile />
      </div>

      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
