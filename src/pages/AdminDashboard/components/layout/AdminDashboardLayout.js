import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../../Dashboard/components/common/SearchBar';
import UserProfile from '../../../Dashboard/components/profile/UserProfile';
import AdminNav from './AdminNav';
import BidspaceLogo from '../../../../assets/images/bidspace_logo.png';

const AdminDashboardLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#F9F9F9]">
      {/* Top Header */}
      <div className="w-full p-6 border-b border-[#E5E5E5] bg-white flex justify-between items-center gap-6">
        <img src={BidspaceLogo} alt="Bidspace Logo" className="w-28" />
        <div className='w-4/5 flex justify-end gap-6 items-center'>
          <SearchBar />
          <UserProfile />
        </div>
      </div>

      {/* Navigation */}
      <AdminNav />

      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
