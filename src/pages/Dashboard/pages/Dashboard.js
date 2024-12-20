import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import WinAuctionsIcon from '../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import ActiveAuctionsIcon from '../../../assets/icons/dashboard/active_auctions_icon.svg';
import EndAuctionsIcon from '../../../assets/icons/dashboard/end_auctions_icon.svg';
import { useAuth } from '../../../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    won: 0,
    active: 0,
    ended: 0
  });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAuctionStats = async () => {
      if (!user) {
        console.log('No user found:', user);
        return;
      }

      try {
        console.log('Fetching auctions for user:', user);
        // Get all auctions
        const allResponse = await fetch('/wp-json/wp/v2/auction?per_page=100');
        if (!allResponse.ok) throw new Error('Failed to fetch all auctions');
        const allAuctions = await allResponse.json();

        // Get user's auctions
        const userResponse = await fetch(`/wp-json/wp/v2/auction?author=${user.id}&per_page=100`);
        if (!userResponse.ok) throw new Error('Failed to fetch user auctions');
        const userAuctions = await userResponse.json();
        
        console.log('All auctions:', allAuctions);
        console.log('User auctions:', userAuctions);
        
        // Filter won auctions from all auctions
        const wonAuctions = allAuctions.filter(auction => {
          const lastBidAuthorId = auction.meta?.last_bid_author_id;
          const userId = user.id;
          
          return lastBidAuthorId && 
                 (lastBidAuthorId === userId.toString() || 
                  parseInt(lastBidAuthorId) === userId);
        });

        // Calculate active and ended stats from user's auctions
        const currentDate = new Date();
        console.log('Current date:', currentDate);

        const activeAuctions = userAuctions.filter(auction => {
          const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;
          console.log('Auction:', {
            id: auction.id,
            title: auction.title.rendered,
            dueTime,
            isActive: dueTime ? currentDate < dueTime : false
          });
          return dueTime && currentDate < dueTime;
        });

        const endedAuctions = userAuctions.filter(auction => {
          const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;
          console.log('Auction:', {
            id: auction.id,
            title: auction.title.rendered,
            dueTime,
            isEnded: dueTime ? currentDate >= dueTime : true
          });
          return !dueTime || currentDate >= dueTime;
        });

        const newStats = {
          won: wonAuctions.length,
          active: activeAuctions.length,
          ended: endedAuctions.length
        };

        console.log('Won auctions:', wonAuctions);
        console.log('Active auctions:', activeAuctions.map(a => ({
          id: a.id,
          title: a.title.rendered,
          dueTime: a.meta?.due_time,
          meta: a.meta
        })));
        console.log('Ended auctions:', endedAuctions.map(a => ({
          id: a.id,
          title: a.title.rendered,
          dueTime: a.meta?.due_time,
          meta: a.meta
        })));
        console.log('Final stats:', newStats);
        
        setStats(newStats);
      } catch (error) {
        console.error('Error fetching auction stats:', error);
      }
    };

    if (user) {
      fetchAuctionStats();
    }
  }, [user]);

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
              <span className="font-bold text-3xl">{stats.won}</span>
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
              <span className="font-bold text-3xl">{stats.active}</span>
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
              <span className="font-bold text-3xl">{stats.ended}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;