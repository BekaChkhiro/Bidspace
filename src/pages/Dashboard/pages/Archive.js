import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Archive = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">არქივი</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {/* Add your archive content here */}
          <p className="text-gray-600">არქივის გვერდი მუშავდება...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Archive;