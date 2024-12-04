import React from 'react';

const AuctionBidsList = ({ bids }) => {
  // დებაგ ლოგი
  console.log('Rendering AuctionBidsList with bids:', bids);

  if (!Array.isArray(bids)) {
    console.error('Bids is not an array:', bids);
    return (
      <div className="text-center text-gray-500 py-4">
        ბიდების მონაცემები არასწორ ფორმატშია
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        ბიდები ჯერ არ არის
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      {bids.map((bid, index) => {
        // დებაგ ლოგი თითოეული ბიდისთვის
        console.log('Rendering bid:', bid);
        
        return (
          <div 
            key={`${bid.key}-${index}`}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <div className="flex flex-col">
              <span className="font-medium">{bid.author_name || 'Unknown'}</span>
              <span className="text-sm text-gray-500">
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
              <span className="font-bold">{bid.bid_price} ₾</span>
              <span className="text-sm text-green-600">+{bid.price_increase} ₾</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuctionBidsList;