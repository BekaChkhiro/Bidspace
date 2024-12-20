import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';

// ქვეკომპონენტები
const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // WordPress-ის REST API-დან მომხმარებლის მონაცემების წამოღება
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${window.location.origin}/wp-json/wp/v2/users/me`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': window.wpApiSettings.nonce
          }
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ჩემი პროფილი</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700">სახელი:</label>
          <p className="font-medium">{userData?.first_name || 'არ არის მითითებული'}</p>
        </div>
        <div>
          <label className="block text-gray-700">გვარი:</label>
          <p className="font-medium">{userData?.last_name || 'არ არის მითითებული'}</p>
        </div>
        <div>
          <label className="block text-gray-700">ელ-ფოსტა:</label>
          <p className="font-medium">{userData?.email}</p>
        </div>
      </div>
    </div>
  );
};

const MyAuctions = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ჩემი აუქციონები</h2>
      {/* აქ დაემატება აუქციონების სია */}
    </div>
  );
};

const MyBids = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">ჩემი ბიდები</h2>
      {/* აქ დაემატება ბიდების სია */}
    </div>
  );
};

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${window.location.origin}/wp-json/wp/v2/users/me`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': window.wpApiSettings.nonce
          }
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">მოგესალმებით, {userData?.first_name || 'მომხმარებელო'}</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <nav className="bg-white shadow rounded-lg p-4">
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/dashboard/profile"
                  className={({ isActive }) => 
                    `block p-2 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`
                  }
                >
                  პროფილი
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/dashboard/my-auctions"
                  className={({ isActive }) => 
                    `block p-2 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`
                  }
                >
                  ჩემი აუქციონები
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/dashboard/my-bids"
                  className={({ isActive }) => 
                    `block p-2 rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`
                  }
                >
                  ჩემი ბიდები
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white shadow rounded-lg p-6">
            <Routes>
              <Route path="profile" element={<Profile />} />
              <Route path="my-auctions" element={<MyAuctions />} />
              <Route path="my-bids" element={<MyBids />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;