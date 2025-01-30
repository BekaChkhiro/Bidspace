import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import profileIcon from '../../../assets/icons/header/loginButtonIcons/profile_icon.svg'
import addAuction from '../../../assets/icons/header/loginButtonIcons/add_to_auction_icon.svg'
import settingsIcon from '../../../assets/icons/header/loginButtonIcons/setting_icon.svg'
import logoutIcon from '../../../assets/icons/header/loginButtonIcons/logout_icon.svg'

const AdminLoginButton = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Get first letter of user's name
  const firstLetter = user?.name?.charAt(0) || 'A';

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };

    document.body.addEventListener('click', closeDropdown);
    return () => document.body.removeEventListener('click', closeDropdown);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/wp-json/custom/v1/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('user');
        sessionStorage.clear();
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative dropdown-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white"
      >
        {firstLetter}
      </button>

      {isOpen && (
        <div 
          id="adminDropdown" 
          className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg py-2 w-[280px] flex flex-col gap-2"
        >
          <Link 
            to="/admin/dashboard" 
            className="w-full flex flex-row gap-2 items-center px-4 py-2 hover:bg-gray-50"
          >
            <img src={profileIcon} alt="Profile Icon" />
            <span className="font-normal text-base text-[#6F7181]">ადმინ პანელი</span>
          </Link>

          <Link 
            to="/admin/auctions" 
            className="w-full flex flex-row gap-2 items-center px-4 py-2 hover:bg-gray-50"
          >
            <img src={addAuction} alt="Add Auction Icon" />
            <span className="font-normal text-base text-[#6F7181]">აუქციონების მართვა</span>
          </Link>

          <Link 
            to="/admin/settings" 
            className="w-full flex flex-row gap-2 items-center px-4 py-2 hover:bg-gray-50"
          >
            <img src={settingsIcon} alt="Settings Icon" />
            <span className="font-normal text-base text-[#6F7181]">პარამეტრები</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full flex flex-row gap-2 items-center px-4 py-2 hover:bg-gray-50"
          >
            <img src={logoutIcon} alt="Logout Icon" />
            <span className="font-normal text-base text-[#FB6B63]">გასვლა</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginButton;
