import React, { useState, useEffect } from 'react';
import BeforeStartTimer from './BeforeStartTimer';
import ActiveAuctionTimer from './ActiveAuctionTimer';
import AuctionBidActions from './AuctionBidActions';
import EndedAuction from './EndedAuction';

const AuctionTimerStatus = ({ auction, startTime, dueTime, currentUserId, onBidPlaced }) => {
  const [auctionEndTime, setAuctionEndTime] = useState(dueTime);

  useEffect(() => {
    setAuctionEndTime(dueTime);
  }, [dueTime]);

  useEffect(() => {
    const handleAuctionUpdate = (event) => {
      if (event.detail?.newTime) {
        setAuctionEndTime(event.detail.newTime);
      }
    };

    document.addEventListener('auctionTimeUpdated', handleAuctionUpdate);
    return () => document.removeEventListener('auctionTimeUpdated', handleAuctionUpdate);
  }, []);

  const handleBidPlaced = (data) => {
    if (data.due_time) {
      setAuctionEndTime(data.due_time);
    }
    if (typeof onBidPlaced === 'function') {
      onBidPlaced(data);
    }
  };

  const currentDate = new Date();
  const startDate = startTime ? new Date(startTime) : null;
  const endDate = auctionEndTime ? new Date(auctionEndTime) : null;

  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-700">აუქციონის დრო არასწორადაა მითითებული</p>
      </div>
    );
  }

  const currentTimestamp = currentDate.getTime();
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  const isBeforeStart = currentTimestamp < startTimestamp;
  const isActive = currentTimestamp >= startTimestamp && currentTimestamp < endTimestamp;
  const isEnded = currentTimestamp >= endTimestamp;

  if (isBeforeStart) {
    const buyNowPrice = auction?.meta?.buy_now; // შევცვალეთ buy_now_price -> buy_now
    
    return (
      <div className="p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-center mb-4">
          აუქციონის დაწყებამდე დარჩენილია
        </h3>
        <BeforeStartTimer 
          targetDate={startDate.toISOString()} 
          buyNowPrice={buyNowPrice}
        />
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="p-4 rounded-lg flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-center mb-4">
          აუქციონის დასრულებამდე დარჩენილია
        </h3>
        <ActiveAuctionTimer endDate={endDate.toISOString()} />
        <AuctionBidActions
          auction={{
            ...auction,
            meta: {
              ...auction.meta,
              due_time: endDate.toISOString()
            }
          }}
          currentUserId={currentUserId}
          onBidPlaced={handleBidPlaced}
        />
      </div>
    );
  }

  if (isEnded) {
    return <EndedAuction auction={auction} currentUserId={currentUserId} />;
  }

  return null;
};

export default AuctionTimerStatus;