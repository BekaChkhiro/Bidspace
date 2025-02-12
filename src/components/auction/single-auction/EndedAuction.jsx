import React, { useEffect } from 'react';
import EndedWonAuction from './EndedWonAuction';
import EndedLostAuction from './EndedLostAuction';

const EndedAuction = ({ auction, currentUserId }) => {
  useEffect(() => {
    const sendWinnerNotification = async () => {
      try {
        const response = await fetch(`/wp-json/wp/v2/auction/${auction.id}/notify-winner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.bidspaceSettings?.restNonce,
            'X-API-Key': window.wpApiSettings?.apiKey || ''
          }
        });

        if (!response.ok) {
          console.error('Failed to send winner notification');
        }
      } catch (error) {
        console.error('Error sending winner notification:', error);
      }
    };

    if (auction?.id) {
      sendWinnerNotification();
    }
  }, [auction?.id]);

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