import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNav = ({ isMobile, onClose }) => {
  const navItems = [
    { path: '/admin', label: 'სამართავი პანელი' },
    { path: '/admin/auctions', label: 'აუქციონები' },
    { path: '/admin/users', label: 'მომხმარებლები' },
    { path: '/admin/payments', label: 'გადახდები' },
    { path: '/admin/analytics', label: 'ანალიტიკა' },
    { path: '/admin/reports', label: 'რეპორტები' },
    { path: '/admin/settings', label: 'პარამეტრები' },
  ];

  const mobileNavClasses = "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50";
  const desktopNavClasses = "bg-white shadow-sm overflow-x-auto";

  return (
    <nav className={isMobile ? mobileNavClasses : desktopNavClasses}>
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">მენიუ</h2>
          <button onClick={onClose} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className={isMobile ? "flex flex-col" : "flex gap-1 px-6"}>
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 ' + (isMobile ? 'bg-blue-50' : 'border-b-2 border-blue-600')
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdminNav;
