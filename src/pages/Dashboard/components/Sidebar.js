import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import profileIcon from '../../../assets/icons/dashboard/profile_icon.svg';
import addAuctionIcon from '../../../assets/icons/dashboard/add_to_auction_icon.svg';
import myAuctionsIcon from '../../../assets/icons/dashboard/my_auctions_icon.svg';
import winAuctionsIcon from '../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import wishlistIcon from '../../../assets/icons/dashboard/my_wishlist_icon.svg';
import archiveIcon from '../../../assets/icons/dashboard/archive_icon.svg';
import settingsIcon from '../../../assets/icons/dashboard/setting_icon.svg';
import logoutIcon from '../../../assets/icons/dashboard/logout_icon.svg';
import bidspaceLogo from '../../../assets/images/bidspace_logo.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getMenuItemClasses = (path) => {
    return location.pathname === path
      ? 'dashboard-menu-item-active w-full flex gap-2 items-center px-6 py-3 border-l-4 border-[#3B82F6] bg-[#F0F7FF]'
      : 'dashboard-menu-item w-full flex gap-2 items-center px-6 py-3 hover:border-l-4 hover:border-[#3B82F6] hover:bg-[#F0F7FF]';
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
    <div className="w-1/6 h-full bg-white flex flex-col justify-between border-r border-[#E5E5E5] pb-6">
      <div className="flex flex-col gap-11">
        {/* Logo */}
        <div className="w-full h-24 p-6" style={{ height: '10%' }}>
          <Link to="/">
            <img src={bidspaceLogo} alt="Logo Icon" className="w-28" />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-4">
          <nav className="w-full flex flex-col gap-2">
            <Link to="/dashboard" className={getMenuItemClasses('/dashboard')}>
              <img src={profileIcon} alt="Profile Icon" />
              <span className="font-normal text-base text-[#6F7181]">პროფილი</span>
            </Link>

            <Link to="/dashboard/add-auction" className={getMenuItemClasses('/dashboard/add-auction')}>
              <img src={addAuctionIcon} alt="Add Auction Icon" />
              <span className="font-normal text-base text-[#6F7181]">აუქციონის დამატება</span>
            </Link>

            <Link to="/dashboard/my-auctions" className={getMenuItemClasses('/dashboard/my-auctions')}>
              <img src={myAuctionsIcon} alt="My Auctions Icon" />
              <span className="font-normal text-base text-[#6F7181]">ჩემი აუქციონები</span>
            </Link>

            <Link to="/dashboard/won-auctions" className={getMenuItemClasses('/dashboard/won-auctions')}>
              <img src={winAuctionsIcon} alt="Won Auctions Icon" />
              <span className="font-normal text-base text-[#6F7181]">მოგებული აუქციონები</span>
            </Link>

            <Link to="/dashboard/wishlist" className={getMenuItemClasses('/dashboard/wishlist')}>
              <img src={wishlistIcon} alt="Wishlist Icon" />
              <span className="font-normal text-base text-[#6F7181]">სურვილების სია</span>
            </Link>
          </nav>

          <hr className="border-[#E5E5E5]" />

          <nav className="w-full flex flex-col gap-2">
            <Link to="/dashboard/archive" className={getMenuItemClasses('/dashboard/archive')}>
              <img src={archiveIcon} alt="Archive Icon" />
              <span className="font-normal text-base text-[#6F7181]">არქივი</span>
            </Link>

            <Link to="/dashboard/settings" className={getMenuItemClasses('/dashboard/settings')}>
              <img src={settingsIcon} alt="Settings Icon" />
              <span className="font-normal text-base text-[#6F7181]">პარამეტრები</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <button onClick={handleLogout} className="flex gap-2 items-center px-6 py-3 hover:bg-[#F0F7FF] w-full">
          <img src={logoutIcon} alt="Logout Icon" />
          <span className="font-normal text-base text-[#FB6B63]">გასვლა</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
