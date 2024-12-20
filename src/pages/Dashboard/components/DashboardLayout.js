import React from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full h-[100vh] flex justify-center bg-[#F9F9F9]">
      <Sidebar />

      {/* Main Content Area */}
      <div className="w-5/6 h-full">
        {/* Top Header */}
        <div className="w-full p-6 border-b border-[#E5E5E5] flex justify-end items-center gap-6" style={{ height: '10%' }}>
          <SearchBar />
          <UserProfile />
        </div>

        {/* Page Content */}
        <div className="p-6 h-[90%] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;