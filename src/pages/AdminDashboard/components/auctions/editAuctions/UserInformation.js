import React from 'react';

const UserInformation = ({ auction, setShowMessageBox }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="pb-2 sm:pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">მომხმარებლის ინფორმაცია</h4>
        </div>
      </div>

      <div className="space-y-6">
        {/* User details */}
        <div className="flex items-center space-x-4">
          {/* ...existing user avatar and details... */}
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* ...existing user info grid... */}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group"
            onClick={() => {/* Handle view profile */}}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            პროფილის ნახვა
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            onClick={() => setShowMessageBox(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            შეტყობინების გაგზავნა
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;