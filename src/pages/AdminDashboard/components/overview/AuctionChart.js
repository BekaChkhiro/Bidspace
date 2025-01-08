import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// რეგისტრირება Chart.js კომპონენტების
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AuctionChart = ({ data, options }) => {
  const [timeRange, setTimeRange] = useState('7');

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    // აქ შეგვიძლია დავამატოთ ლოგიკა სხვადასხვა პერიოდის მონაცემების ჩასატვირთად
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">აუქციონების აქტივობა</h3>
        <select 
          className="text-sm border rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={timeRange}
          onChange={handleTimeRangeChange}
        >
          <option value="7">ბოლო 7 დღე</option>
          <option value="30">ბოლო 30 დღე</option>
          <option value="90">ბოლო 3 თვე</option>
        </select>
      </div>
      <div className="h-[300px]">
        <Bar 
          data={data} 
          options={{
            ...options,
            maintainAspectRatio: false,
            responsive: true,
          }} 
        />
      </div>
    </div>
  );
};

export default AuctionChart;
