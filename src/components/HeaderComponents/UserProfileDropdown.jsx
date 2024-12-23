import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import profileIcon from '../../assets/icons/dashboard/profile_icon.svg';
import addAuctionIcon from '../../assets/icons/dashboard/add_to_auction_icon.svg';
import myAuctionsIcon from '../../assets/icons/dashboard/my_auctions_icon.svg';
import winAuctionsIcon from '../../assets/icons/dashboard/win_auctions_with_bg.svg';
import wishlistIcon from '../../assets/icons/dashboard/my_wishlist_icon.svg';
import archiveIcon from '../../assets/icons/dashboard/archive_icon.svg';
import settingsIcon from '../../assets/icons/dashboard/setting_icon.svg';
import logoutIcon from '../../assets/icons/dashboard/logout_icon.svg';

const UserProfileDropdown = ({ user }) => {
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
        className="flex items-center gap-2 p-2 bg-white rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="font-medium">{user?.name}</span>
      </div>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#e5e5e5]">
          <Link 
            to="/dashboard/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={profileIcon} className="w-5 h-5" alt="profile" />
            <span>პროფილი</span>
          </Link>
          <Link 
            to="/dashboard/add-auction"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={addAuctionIcon} className="w-5 h-5" alt="add auction" />
            <span>აუქციონის დამატება</span>
          </Link>
          <Link 
            to="/dashboard/my-auctions"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={myAuctionsIcon} className="w-5 h-5" alt="my auctions" />
            <span>ჩემი აუქციონები</span>
          </Link>
          <Link 
            to="/dashboard/win-auctions"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={winAuctionsIcon} className="w-5 h-5" alt="win auctions" />
            <span>მოგებული აუქციონები</span>
          </Link>
          <Link 
            to="/dashboard/wishlist"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={wishlistIcon} className="w-5 h-5" alt="wishlist" />
            <span>სურვილების სია</span>
          </Link>
          <Link 
            to="/dashboard/archive"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={archiveIcon} className="w-5 h-5" alt="archive" />
            <span>არქივი</span>
          </Link>
          <Link 
            to="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <img src={settingsIcon} className="w-5 h-5" alt="settings" />
            <span>პარამეტრები</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#FB6B63] hover:bg-gray-100"
          >
            <img src={logoutIcon} className="w-5 h-5" alt="logout" />
            <span>გასვლა</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
