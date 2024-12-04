import { useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';

export const useAuctionPolling = (auctionId) => {
  const { updateAuction, updateBidsList } = useAuction();
  const pollingRef = useRef(null);

  const transformBidsToArray = (bidsObject) => {
    if (!bidsObject) return [];
    
    return Object.entries(bidsObject)
      .map(([key, bid]) => ({
        ...bid,
        bid_price: Number(bid.bid_price),
        price_increase: Number(bid.price_increase),
        bid_author: Number(bid.bid_author) || bid.bid_author,
        author_name: bid.author_name || "Unknown",
        key
      }))
      .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time));
  };

  const fetchAuctionData = async () => {
    try {
      const response = await fetch(`/wp-json/bidspace/v1/auction/${auctionId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      updateAuction(auctionId, data);
      
      if (data.meta?.bids_list) {
        const transformedBids = transformBidsToArray(data.meta.bids_list);
        updateBidsList(auctionId, transformedBids);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
    }
  };

  useEffect(() => {
    // პირველი fetch
    fetchAuctionData();
    
    // დავიწყოთ polling
    pollingRef.current = setInterval(fetchAuctionData, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [auctionId]);
};