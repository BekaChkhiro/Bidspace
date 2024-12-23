import { useEffect, useRef } from 'react';
import { useAuction } from '../components/core/context/AuctionContext';

export const useAuctionPolling = (auctionId) => {
  const { updateAuction, updateBidsList } = useAuction();
  const pollingRef = useRef(null);
  const userCacheRef = useRef({});

  const fetchUserName = async (userId) => {
    // Return cached user name if available
    if (userCacheRef.current[userId]) {
      return userCacheRef.current[userId];
    }

    try {
      const response = await fetch(`/wp-json/bidspace/v1/auction/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      const name = userData.display_name || "Unknown";
      // Cache the user name
      userCacheRef.current[userId] = name;
      return name;
    } catch (error) {
      console.error(`Error fetching user ${userId} data:`, error);
      return "Unknown";
    }
  };

  const transformBidsToArray = async (bidsObject) => {
    if (!bidsObject) return [];
    
    const bidsArray = Array.isArray(bidsObject) ? bidsObject : Object.entries(bidsObject).map(([key, bid]) => ({
      ...bid,
      key
    }));

    // Fetch all user names in parallel
    const transformedBids = await Promise.all(
      bidsArray.map(async (bid) => {
        const authorName = await fetchUserName(bid.bid_author);
        return {
          ...bid,
          bid_price: Number(bid.bid_price),
          price_increase: Number(bid.price_increase),
          bid_author: Number(bid.bid_author) || bid.bid_author,
          author_name: authorName
        };
      })
    );

    return transformedBids.sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time));
  };

  const fetchAuctionData = async () => {
    try {
      const response = await fetch(`/wp-json/bidspace/v1/auction/${auctionId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      updateAuction(auctionId, data);
      
      if (data.meta?.bids_list) {
        const transformedBids = await transformBidsToArray(data.meta.bids_list);
        updateBidsList(auctionId, transformedBids);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
    }
  };

  useEffect(() => {
    fetchAuctionData();
    // Poll every 2 seconds instead of 5
    pollingRef.current = setInterval(fetchAuctionData, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [auctionId]);
};