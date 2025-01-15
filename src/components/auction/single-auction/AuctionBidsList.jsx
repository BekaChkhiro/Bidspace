import React, { useEffect, useState, useRef } from 'react';

const BidSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const AuctionBidsList = ({ bids }) => {
  const [enrichedBids, setEnrichedBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevBidsRef = useRef();

  useEffect(() => {
    const enrichBidsWithUserNames = async () => {
      if (!Array.isArray(bids)) {
        console.error('Bids is not an array:', bids);
        setIsLoading(false);
        return;
      }

      // Only set loading state on first load or if bids length changes significantly
      if (!prevBidsRef.current || Math.abs(prevBidsRef.current.length - bids.length) > 1) {
        setIsLoading(true);
      }

      try {
        const enrichedBidsData = await Promise.all(
          bids.map(async (bid) => {
            if (!bid.author_name && bid.bid_author) {
              try {
                const response = await fetch(`/wp-json/wp/v2/users/${bid.bid_author}`);
                if (response.ok) {
                  const userData = await response.json();
                  return { ...bid, author_name: userData.name };
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }
            return bid;
          })
        );
        setEnrichedBids(enrichedBidsData);
      } catch (error) {
        console.error('Error enriching bids:', error);
        setEnrichedBids(bids);
      } finally {
        setIsLoading(false);
      }
    };

    enrichBidsWithUserNames();
    prevBidsRef.current = bids;
  }, [bids]);

  if (isLoading && !prevBidsRef.current) {
    return (
      <div className="h-[250px] sm:max-h-60 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <BidSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!Array.isArray(bids)) {
    return (
      <div className="h-[250px] sm:max-h-60 overflow-y-auto flex items-center justify-center">
        <p className="text-center text-gray-500">
          ბიდების მონაცემები არასწორ ფორმატშია
        </p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="h-[250px] sm:max-h-60 overflow-y-auto flex items-center justify-center">
        <p className="text-center text-gray-500">
          ბიდები ჯერ არ არის
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px] sm:max-h-60 overflow-y-auto">
      {(isLoading ? prevBidsRef.current : enrichedBids).map((bid, index) => (
        <div 
          key={`${bid.bid_time}-${index}`}
          className="flex justify-between items-start sm:items-center py-2 border-b last:border-b-0"
        >
          <div className="flex flex-col">
            <span className="font-medium text-sm sm:text-base">
              {bid.author_name || bid.bid_author || 'Unknown'}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {new Date(bid.bid_time).toLocaleString('ka-GE', {
                timeZone: 'Asia/Tbilisi',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-sm sm:text-base">{bid.bid_price} ₾</span>
            <span className="text-xs sm:text-sm text-green-600">+{bid.price_increase} ₾</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuctionBidsList;