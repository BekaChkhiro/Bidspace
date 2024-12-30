import React from 'react';

const UserDetailsSidebar = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('ka-GE');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">მომხმარებლის დეტალები</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg 
                className="w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {user && (
              <div className="space-y-6">
                {/* User Avatar and Name */}
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden">
                    {user.avatar_urls && (
                      <img 
                        src={user.avatar_urls['96']} 
                        alt={user.name || 'User avatar'}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">@{user.slug}</p>
                    <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      აქტიური
                    </span>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">ძირითადი ინფორმაცია</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">ID</label>
                      <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500">როლი</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">ელ-ფოსტა</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">რეგისტრაციის თარიღი</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(user.registered_date)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500">ბოლო შესვლა</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.last_login ? formatDate(user.last_login) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Data */}
                {user.meta && Object.keys(user.meta).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">მეტა მონაცემები</h4>
                    {Object.entries(user.meta).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-gray-500">{key}</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailsSidebar;
