import React from 'react';

const CategoryStats = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">პოპულარული კატეგორიები</h3>
      <select className="text-sm border rounded-md px-2 py-1">
        <option>ბოლო 7 დღე</option>
        <option>ბოლო 30 დღე</option>
        <option>ბოლო 3 თვე</option>
      </select>
    </div>
    <div className="space-y-4">
      <CategoryBar name="უძრავი ქონება" percentage={45} />
      <CategoryBar name="ავტომობილები" percentage={30} />
      <CategoryBar name="ხელოვნება" percentage={15} />
    </div>
  </div>
);

const CategoryBar = ({ name, percentage }) => (
  <div className="flex items-center">
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-black rounded-full h-2" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </div>
);

export default CategoryStats;
