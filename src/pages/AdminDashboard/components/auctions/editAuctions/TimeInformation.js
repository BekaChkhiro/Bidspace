import React from 'react';

const TimeInformation = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">დრო</h4>
        </div>
        <p className="mt-1 text-sm text-gray-500">მიუთითეთ აუქციონის დაწყებისა და დასრულების დრო</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            დაწყების დრო
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            დასრულების დრო
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={formData.due_time}
              onChange={(e) => setFormData({...formData, due_time: e.target.value})}
              className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeInformation;