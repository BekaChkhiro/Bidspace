import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNav = () => {
  const navItems = [
    { path: '/admin', label: 'სამართავი პანელი' },
    { path: '/admin/auctions', label: 'აუქციონები' },
    { path: '/admin/users', label: 'მომხმარებლები' },
    { path: '/admin/payments', label: 'გადახდები' },
    { path: '/admin/analytics', label: 'ანალიტიკა' },
    { path: '/admin/reports', label: 'რეპორტები' },
    { path: '/admin/settings', label: 'პარამეტრები' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="flex gap-1 px-6">
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
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
