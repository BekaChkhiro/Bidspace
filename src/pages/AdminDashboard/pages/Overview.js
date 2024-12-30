import React from 'react';
import StatsCard from '../components/overview/StatsCard';
import AuctionChart from '../components/overview/AuctionChart';
import CategoryStats from '../components/overview/CategoryStats';
import RecentSales from '../components/overview/RecentSales';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useOverviewData } from '../hooks/useOverviewData';

const Overview = () => {
  const { 
    loading,
    dateRange,
    setDateRange,
    chartData,
    chartOptions,
    stats,
    recentSales
  } = useOverviewData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* სტატისტიკის ბარათები */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* გრაფიკები */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuctionChart data={chartData} options={chartOptions} />
        <CategoryStats />
      </div>

      {/* ბოლო გაყიდვები */}
      <RecentSales sales={recentSales} />
    </div>
  );
};

export default Overview;
