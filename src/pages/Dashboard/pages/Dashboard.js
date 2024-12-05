import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import WinAuctionsIcon from '../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import ActiveAuctionsIcon from '../../../assets/icons/dashboard/active_auctions_icon.svg';
import EndAuctionsIcon from '../../../assets/icons/dashboard/end_auctions_icon.svg';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="w-full flex flex-col gap-3 p-6 bg-white rounded-2xl">
          <span className="text-lg font-bold">დღეს</span>
          <div className="w-full flex justify-between items-center gap-4">
            <div 
              className="w-1/3 flex flex-col gap-6 p-4 rounded-2xl" 
              style={{
                background: `url(${WinAuctionsIcon}), #DCFCE7`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">მოგებული აუქციონები</span>
              <span className="font-bold text-3xl">10</span>
            </div>

            <div 
              className="w-1/3 flex flex-col gap-6 p-4 rounded-2xl"
              style={{
                background: `url(${ActiveAuctionsIcon}), #FFF4DE`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">მიმდინარე აუქციონები</span>
              <span className="font-bold text-3xl">11</span>
            </div>

            <div 
              className="w-1/3 flex flex-col gap-4 p-6 rounded-2xl"
              style={{
                background: `url(${EndAuctionsIcon}), #F3E8FF`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">დასრულებული აუქციონები</span>
              <span className="font-bold text-3xl">16</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;