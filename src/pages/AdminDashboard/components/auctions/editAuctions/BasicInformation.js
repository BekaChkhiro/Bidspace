import React from 'react';

const BasicInformation = ({ formData, setFormData, handleCategorySelect, handleCitySelect, showOtherCity, showSazgvargaret, renderCategorySpecificFields }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-2 pb-3 sm:pb-4 border-b border-gray-200">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h4 className="text-base sm:text-lg font-semibold text-gray-900">ძირითადი ინფორმაცია</h4>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        სათაური
        </label>
        <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
        placeholder="შეიყვანეთ აუქციონის სათაური"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Category Select */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          კატეგორია
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleCategorySelect(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
        >
          <option value="">აირჩიეთ კატეგორია</option>
          <option value="თეატრი-კინო">თეატრი-კინო</option>
          <option value="სპორტი">სპორტი</option>
          <option value="მოგზაურობა">მოგზაურობა</option>
        </select>
        </div>

        {/* City Select */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ქალაქი
        </label>
        <select
          value={formData.city}
          onChange={(e) => handleCitySelect(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
        >
          <option value="">აირჩიეთ ქალაქი</option>
          <option value="თბილისი">თბილისი</option>
          <option value="ბათუმი">ბათუმი</option>
          <option value="ქუთაისი">ქუთაისი</option>
          <option value="სხვა_ქალაქები">სხვა ქალაქები</option>
          <option value="საზღვარგარეთ">საზღვარგარეთ</option>
        </select>
        </div>
      </div>

      {/* Conditional City Inputs */}
      {showOtherCity && (
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            სხვა ქალაქი
          </label>
          <input
            type="text"
            value={formData.skhva_qalaqebi}
            onChange={(e) => setFormData({...formData, skhva_qalaqebi: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
            placeholder="შეიყვანეთ ქალაქის სახელი"
          />
        </div>
      )}

      {showSazgvargaret && (
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            საზღვარგარეთ
          </label>
          <input
            type="text"
            value={formData.sazgvargaret}
            onChange={(e) => setFormData({...formData, sazgvargaret: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
            placeholder="შეიყვანეთ ქვეყნის სახელი"
          />
        </div>
      )}

      {renderCategorySpecificFields()}
      </div>
    </div>
    );
};

export default BasicInformation;