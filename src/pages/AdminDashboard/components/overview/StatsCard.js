import React from 'react';

const StatsCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        <p className="text-sm text-green-600 mt-1">{change}</p>
      </div>
      <div className="p-2 bg-black bg-opacity-5 rounded-full">
        {Icon}
      </div>
    </div>
  </div>
);

export default StatsCard;
