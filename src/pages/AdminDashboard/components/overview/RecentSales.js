import React from 'react';

const RecentSales = ({ sales }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">ბოლო გაყიდვები</h3>
      <button className="text-sm text-gray-500 hover:text-gray-700">
        ყველას ნახვა
      </button>
    </div>
    <div className="divide-y">
      {sales.map((sale, i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="ml-4">
              <p className="text-sm font-medium">{sale.name}</p>
              <p className="text-sm text-gray-500">{sale.email}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-green-600">{sale.amount}</p>
        </div>
      ))}
    </div>
  </div>
);

export default RecentSales;
