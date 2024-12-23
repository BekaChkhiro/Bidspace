import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const DashboardNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="text-white mb-8">
        <h2 className="text-xl font-bold">მენიუ</h2>
      </div>
      <ul className="space-y-2">
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
              } text-white`
            }
          >
            მთავარი
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
              } text-white`
            }
          >
            პროფილი
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/my-auctions"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
              } text-white`
            }
          >
            ჩემი აუქციონები
          </NavLink>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-white"
          >
            გასვლა
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default DashboardNav;