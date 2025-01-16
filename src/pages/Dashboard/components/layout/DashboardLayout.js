import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from '../common/SearchBar';
import UserProfile from '../profile/UserProfile';
import BidspaceLogo from '../../../../assets/images/bidspace_logo.png';

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden w-full p-4 border-b border-[#E5E5E5] bg-white flex justify-between items-center fixed top-0 left-0 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/">
          <img src={BidspaceLogo} alt="Bidspace Logo" className="w-24" />
        </Link>
        <UserProfile />
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className="relative w-[280px] h-full bg-white">
          <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="w-full h-[100vh] hidden md:flex justify-center bg-[#F9F9F9]">
        <div className="w-1/6 h-full">
          <Sidebar />
        </div>

        <div className="w-5/6 h-full">
          <div className="w-full p-6 border-b border-[#E5E5E5] flex justify-end items-center gap-6" style={{ height: '10%' }}>
            <SearchBar />
            <UserProfile />
          </div>

          <div className="p-6 h-[90%] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden w-full min-h-screen bg-[#F9F9F9] pt-[60px]">
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;