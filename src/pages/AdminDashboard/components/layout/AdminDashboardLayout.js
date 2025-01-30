import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../../Dashboard/components/common/SearchBar';
import UserProfile from '../../../Dashboard/components/profile/UserProfile';
import AdminNav from './AdminNav';
import BidspaceLogo from '../../../../assets/images/bidspace_logo.png';

const AdminDashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9]">
        <div className="w-full p-4 md:p-6 border-b border-[#E5E5E5] bg-white flex justify-between items-center gap-4 md:gap-6 fixed top-0 left-0 z-40">
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/">
            <img src={BidspaceLogo} alt="Bidspace Logo" className="w-24 md:w-28" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <AdminNav />
          </div>
          <div className='hidden md:flex w-4/5 justify-end gap-6 items-center'>
            <SearchBar />
            <UserProfile />
          </div>
          <div className="md:hidden">
            <UserProfile />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
        <AdminNav isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Page Content */}
      <div className="p-4 md:p-6 mt-[73px] md:mt-[95px]">
        {children}
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
