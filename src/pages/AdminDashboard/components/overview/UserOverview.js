import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserOverview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/users?per_page=5');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">ბოლოს დარეგისტრირებული მომხმარებლები</h2>
        <Link
          to="/admin/users"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <span>ყველას ნახვა</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-2 px-2 sm:px-0 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                {user.avatar_urls && (
                  <img 
                    src={user.avatar_urls['96']} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs sm:text-sm text-gray-500">{user.slug}</div>
              </div>
            </div>
            <span className="px-2 py-1 text-xs leading-4 sm:leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              აქტიური
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOverview;