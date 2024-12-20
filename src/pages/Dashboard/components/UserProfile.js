import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
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
  );
};

export default UserProfile;
