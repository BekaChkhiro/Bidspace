import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Overview from './Overview';
import Auctions from './Auctions';
import Users from './Users';
import Payments from './Payments';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('სამართავი პანელი');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'სამართავი პანელი':
        return <Overview />;
      case 'აუქციონები':
        return <Auctions />;
      case 'მომხმარებლები':
        return <Users />;
      case 'გადახდები':
        return <Payments />;
      default:
        return <Overview />;
    }
  };

  const tabs = ['სამართავი პანელი', 'აუქციონები', 'მომხმარებლები', 'გადახდები'];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 ${
              activeTab === tab
                ? 'border-b-2 border-black font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
