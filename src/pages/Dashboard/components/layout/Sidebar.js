import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import ProfileIcon from '../../../../assets/icons/dashboard/profile_icon.svg';
import AddToAuctionIcon from '../../../../assets/icons/dashboard/add_to_auction_icon.svg';
import MyAuctionsIcon from '../../../../assets/icons/dashboard/my_auctions_icon.svg';
import WinAuctionsIcon from '../../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import WishlistIcon from '../../../../assets/icons/dashboard/my_wishlist_icon.svg';
import ArchiveIcon from '../../../../assets/icons/dashboard/archive_icon.svg';
import SettingsIcon from '../../../../assets/icons/dashboard/setting_icon.svg';
import LogoutIcon from '../../../../assets/icons/dashboard/logout_icon.svg';
import Logo from '../../../../assets/images/bidspace_logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const getMenuItemClasses = (path) => {
    return location.pathname === path
      ? 'dashboard-menu-item-active w-full flex gap-2 items-center px-6 py-3 border-l-4 border-[#3B82F6] bg-[#F0F7FF]'
      : 'dashboard-menu-item w-full flex gap-2 items-center px-6 py-3 hover:border-l-4 hover:border-[#3B82F6] hover:bg-[#F0F7FF]';
  };

  const handleLogout = async () => {
    try {
      await logout();
      location.pathname = '/';
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
            <img src={Logo} alt="Logo Icon" className="w-28" />
          </Link>
        </div>

        <div className="w-full flex flex-col gap-4">
          <nav className="w-full flex flex-col gap-2">
            <Link to="/dashboard" className={getMenuItemClasses('/dashboard')}>
              <img src={ProfileIcon} alt="Profile Icon" />
              <span className="font-normal text-base text-[#6F7181]">პროფილი</span>
            </Link>

            <Link to="/dashboard/add-auction" className={getMenuItemClasses('/dashboard/add-auction')}>
              <img src={AddToAuctionIcon} alt="Add Auction Icon" />
              <span className="font-normal text-base text-[#6F7181]">აუქციონის დამატება</span>
            </Link>

            <Link to="/dashboard/my-auctions" className={getMenuItemClasses('/dashboard/my-auctions')}>
              <img src={MyAuctionsIcon} alt="My Auctions Icon" />
              <span className="font-normal text-base text-[#6F7181]">ჩემი აუქციონები</span>
            </Link>

            <Link to="/dashboard/won-auctions" className={getMenuItemClasses('/dashboard/won-auctions')}>
              <img src={WinAuctionsIcon} alt="Won Auctions Icon" />
              <span className="font-normal text-base text-[#6F7181]">მოგებული აუქციონები</span>
            </Link>

            <Link to="/dashboard/wishlist" className={getMenuItemClasses('/dashboard/wishlist')}>
              <img src={WishlistIcon} alt="Wishlist Icon" />
              <span className="font-normal text-base text-[#6F7181]">სურვილების სია</span>
            </Link>
          </nav>

          <hr className="border-[#E5E5E5]" />

          <nav className="w-full flex flex-col gap-2">
            <Link to="/dashboard/archive" className={getMenuItemClasses('/dashboard/archive')}>
              <img src={ArchiveIcon} alt="Archive Icon" />
              <span className="font-normal text-base text-[#6F7181]">არქივი</span>
            </Link>

            <Link to="/dashboard/settings" className={getMenuItemClasses('/dashboard/settings')}>
              <img src={SettingsIcon} alt="Settings Icon" />
              <span className="font-normal text-base text-[#6F7181]">პარამეტრები</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <button onClick={handleLogout} className="flex gap-2 items-center px-6 py-3 hover:bg-[#F0F7FF] w-full">
          <img src={LogoutIcon} alt="Logout Icon" />
          <span className="font-normal text-base text-[#FB6B63]">გასვლა</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
