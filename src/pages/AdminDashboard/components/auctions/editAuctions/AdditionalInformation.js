import React from 'react';

const AdditionalInformation = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="pb-2 sm:pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">დამატებითი ინფორმაცია</h4>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">მიუთითეთ ბილეთის შესახებ დამატებითი ინფორმაცია</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ბილეთის ინფორმაცია
        </label>
        <textarea
          value={formData.ticket_information}
          onChange={(e) => setFormData({...formData, ticket_information: e.target.value})}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400 resize-none"
          placeholder="შეიყვანეთ დამატებითი ინფორმაცია ბილეთის შესახებ..."
        />
      </div>
    </div>
  );
};

export default AdditionalInformation;