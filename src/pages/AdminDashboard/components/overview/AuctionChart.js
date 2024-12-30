import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const AuctionChart = ({ data, options }) => {
  const [timeRange, setTimeRange] = useState('7');

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    // აქ შეგვიძლია დავამატოთ ლოგიკა სხვადასხვა პერიოდის მონაცემების ჩასატვირთად
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">აუქციონების აქტივობა</h3>
        <select 
          className="text-sm border rounded-md px-2 py-1"
          value={timeRange}
          onChange={handleTimeRangeChange}
        >
          <option value="7">ბოლო 7 დღე</option>
          <option value="30">ბოლო 30 დღე</option>
          <option value="90">ბოლო 3 თვე</option>
        </select>
      </div>
      <Bar data={data} options={options} height={100} />
    </div>
  );
};

export default AuctionChart;
