import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logoutIcon from '../../../assets/icons/dashboard/logout_icon.svg';
import backArrow from '../../../assets/icons/dashboard/back-arrow.svg';
import AuctionIcon from '../../../assets/icons/dashboard/my_auctions_icon.svg';

const SiteActions = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={toggleDropdown}
        className="relative"
      >
        <button
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium hover:bg-gray-900 transition-colors"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>
      </div>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#e5e5e5]">
          <Link 
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={backArrow} className="w-5 h-5" alt="Back Arrow" />
            <span className='text-base'>საიტზე დაბრუნება</span>
          </Link>
          <Link 
            to="/auction"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={AuctionIcon} className="w-5 h-5" alt="Back Arrow" />
            <span className='text-base'>აუქციონები</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#FB6B63] hover:bg-gray-100"
          >
            <img src={logoutIcon} className="w-5 h-5" alt="logout" />
            <span className='text-base'>გასვლა</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SiteActions;
