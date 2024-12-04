import React from 'react'
import { Outlet, NavLink, Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const userInitial = user?.name?.charAt(0) || 'U'

  return (
    <div className="w-full h-screen flex justify-center" style={{ background: '#F9F9F9' }}>
      <div className="w-1/6 h-full bg-white flex flex-col justify-between border-r pb-6" style={{ borderColor: '#E5E5E5' }}>
        <div className="flex flex-col gap-11">
          <div className="w-full h-24 p-6" style={{ height: '10%' }}>
            <a href="/">
              <img src="/wp-content/themes/brads-boilerplate-theme-tailwind/build/images/bidspace_logo.0f990384.png" alt="Logo" />
            </a>
          </div>

          <div className="w-full flex flex-col gap-4">
            <nav className="w-full flex flex-col gap-2">
              <NavLink 
                to="/dashboard/profile" 
                className={({ isActive }) => `w-full flex gap-2 items-center hover:border-l ${isActive ? 'dashboard-menu-item-active' : 'dashboard-menu-item'}`}
              >
                <img src="/wp-content/themes/your-theme/icons/dashboard/profile_icon.svg" alt="Profile" />
                <span className="font-normal text-base" style={{ color: '#6F7181' }}>პროფილი</span>
              </NavLink>
            </nav>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <button onClick={logout} className="flex gap-2">
            <img src="/wp-content/themes/your-theme/icons/dashboard/logout_icon.svg" alt="Logout" />
            <span className="font-normal text-base" style={{ color: '#FB6B63' }}>გასვლა</span>
          </button>
        </div>
      </div>

      <div className="w-5/6">
        <div className="w-full p-6 border-b flex justify-end items-center gap-6" style={{ borderColor: '#E5E5E5', height: '10%' }}>
          <div className="relative w-1/3">
            <input 
              type="text" 
              placeholder="ძებნა"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <img src="/wp-content/themes/your-theme/icons/search_icon.svg" alt="Search" className="w-5 h-5" />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center bg-white rounded-full p-1" style={{ cursor: 'pointer', boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#00AEEF' }}>
                <span className="text-white font-bold">{userInitial}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full p-6 overflow-y-scroll" style={{ height: '90%' }}>
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-auction" element={<AddAuction />} />
            <Route path="/my-auctions" element={<MyAuctions />} />
            <Route path="/won-auctions" element={<WonAuctions />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/verification" element={<Verification />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout