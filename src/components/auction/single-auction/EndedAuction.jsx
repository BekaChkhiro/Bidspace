import React from 'react';
import EndedWonAuction from './EndedWonAuction';
import EndedLostAuction from './EndedLostAuction';

const EndedAuction = ({ auction, currentUserId }) => {
  if (!auction) {
    return <div className="text-center py-4">აუქციონის მონაცემები არ მოიძებნა</div>;
  }

  const getLastBid = () => {
    if (!auction?.meta?.bids_list) return null;
    
    const bidsList = Array.isArray(auction.meta.bids_list) 
      ? auction.meta.bids_list
      : Object.values(auction.meta.bids_list);
    
    return bidsList.sort((a, b) => {
      const timeA = new Date(a.bid_time);
      const timeB = new Date(b.bid_time);
      return timeB - timeA;
    })[0];
  };

  const lastBid = getLastBid();
  const isWinner = lastBid && Number(lastBid.bid_author) === Number(currentUserId);

  if (isWinner) {
    return <EndedWonAuction auctionData={auction} />;
  }

  return <EndedLostAuction auctionData={auction} />;
};

export default EndedAuction;