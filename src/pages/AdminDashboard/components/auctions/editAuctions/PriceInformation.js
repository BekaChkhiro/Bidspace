import React from 'react';

const PriceInformation = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">ფასები</h4>
        </div>
        <p className="mt-1 text-sm text-gray-500">მიუთითეთ აუქციონის ფასები</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ბილეთის ფასი
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.ticket_price}
              onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
              className="form-input w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
              placeholder="0.00"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ბილეთების რაოდენობა
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.ticket_quantity}
              onChange={(e) => setFormData({...formData, ticket_quantity: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              ცალი
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            საწყისი ფასი
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.auction_price}
              onChange={(e) => setFormData({...formData, auction_price: e.target.value})}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
              placeholder="0.00"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ახლავე ყიდვის ფასი
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.buy_now}
              onChange={(e) => setFormData({...formData, buy_now: e.target.value})}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
              placeholder="0.00"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            მინიმალური ბიჯი
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.min_bid_price}
              onChange={(e) => setFormData({...formData, min_bid_price: e.target.value})}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
              placeholder="0.00"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceInformation;