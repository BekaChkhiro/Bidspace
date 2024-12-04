import React, { useState } from 'react';
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


const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const getMenuItemClasses = (path) => {
    return location.pathname === path
      ? 'dashboard-menu-item-active w-full flex gap-2 items-center px-6 py-3 border-l-4 border-[#3B82F6] bg-[#F0F7FF]'
      : 'dashboard-menu-item w-full flex gap-2 items-center px-6 py-3 hover:border-l-4 hover:border-[#3B82F6] hover:bg-[#F0F7FF]';
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      try {
        const response = await fetch(`/wp-json/wp/v2/search?search=${query}&type=post&subtype=auction`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
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
    <div className="w-full h-full flex justify-center bg-[#F9F9F9]">
      {/* Left Sidebar */}
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
            <span className="font-normal text-base text-[#6F7181]">გასვლა</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-5/6 h-full">
        {/* Top Header */}
        <div className="w-full p-6 border-b border-[#E5E5E5] flex justify-end items-center gap-6" style={{ height: '10%' }}>
          {/* Search Input */}
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="ძებნა"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-10">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    to={`/auction/${result.id}`}
                    className="block px-4 py-2 hover:bg-[#F0F7FF]"
                  >
                    {result.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-[#6F7181]">{user?.name || 'User'}</span>
            </button>

            {isUserDropdownOpen && (
              <div className="user-dropdown">
                <Link to="/dashboard/profile" className="block">
                  პროფილი
                </Link>
                <Link to="/dashboard/settings" className="block">
                  პარამეტრები
                </Link>
                <button onClick={handleLogout} className="w-full text-left">
                  გასვლა
                </button>
              </div>
            )}
          </div>
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
