import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../components/core/context/AuthContext';
import DashboardIcon from '../../../../assets/icons/dashboard/profile_icon.svg';
import AuctionsIcon from '../../../../assets/icons/dashboard/my_auctions_icon.svg';
import UsersIcon from '../../../../assets/icons/dashboard/profile_icon.svg';
import SettingsIcon from '../../../../assets/icons/dashboard/setting_icon.svg';
import LogoutIcon from '../../../../assets/icons/dashboard/logout_icon.svg';
import Logo from '../../../../assets/images/bidspace_logo.png';

const AdminSidebar = () => {
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
            <Link to="/admin" className={getMenuItemClasses('/admin')}>
              <img src={DashboardIcon} alt="Dashboard Icon" />
              <span className="font-normal text-base text-[#6F7181]">მთავარი</span>
            </Link>

            <Link to="/admin/auctions" className={getMenuItemClasses('/admin/auctions')}>
              <img src={AuctionsIcon} alt="Auctions Icon" />
              <span className="font-normal text-base text-[#6F7181]">აუქციონები</span>
            </Link>

            <Link to="/admin/users" className={getMenuItemClasses('/admin/users')}>
              <img src={UsersIcon} alt="Users Icon" />
              <span className="font-normal text-base text-[#6F7181]">მომხმარებლები</span>
            </Link>

            <Link to="/admin/settings" className={getMenuItemClasses('/admin/settings')}>
              <img src={SettingsIcon} alt="Settings Icon" />
              <span className="font-normal text-base text-[#6F7181]">პარამეტრები</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex gap-2 items-center px-6 py-3 hover:bg-[#F0F7FF]"
      >
        <img src={LogoutIcon} alt="Logout Icon" />
        <span className="font-normal text-base text-[#6F7181]">გასვლა</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
