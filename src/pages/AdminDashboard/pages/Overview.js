import React from 'react';
import StatsCard from '../components/overview/StatsCard';
import RecentSales from '../components/overview/RecentSales';
import LoadingSpinner from '../../../components/ui-elements/LoadingSpinner';
import { useOverviewData } from '../hooks/useOverviewData';
import RecentAuctions from '../components/overview/RecentAuctions';

// Add UserOverview component
import UserOverview from '../components/overview/UserOverview';

const Overview = () => {
  const { 
    loading,
    stats,
    recentSales
  } = useOverviewData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* სტატისტიკის ბარათები */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <RecentAuctions />

      {/* მომხმარებლების მიმოხილვა */}
      <UserOverview />

      
    </div>
  );
};

export default Overview;
