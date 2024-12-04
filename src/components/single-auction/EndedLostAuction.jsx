import React from 'react';
import EndedLostIcon from '../../icons/auction/ended_lost_auction.svg';
import DateIcon from '../../icons/auction/date_icon.svg';

const EndedLostAuction = ({ auctionData }) => {
  // Get the last bid from the bids list
  const getLastBid = () => {
    if (!auctionData?.meta?.bids_list) return null;
    
    // Handle both array and object formats from the API
    const bidsList = Array.isArray(auctionData.meta.bids_list) 
      ? auctionData.meta.bids_list
      : Object.values(auctionData.meta.bids_list);
    
    // Sort by bid time and get the latest
    return bidsList.sort((a, b) => {
      const timeA = new Date(a.bid_time);
      const timeB = new Date(b.bid_time);
      return timeB - timeA;
    })[0];
  };

  const lastBid = getLastBid();
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('ka-GE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    const formattedTime = date.toLocaleString('ka-GE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <div className="w-full flex flex-col py-6 gap-6">
      <div className="flex justify-center items-center gap-6">
        <img src={EndedLostIcon} alt="Auction ended icon" />
        <span className="font-normal text-lg text-[#FF0101]">აუქციონი დასრულდა!</span>
      </div>

      <div className="w-full border-y p-6 flex flex-col items-center gap-6">
        <span className="w-11/12 font-bold text-lg">
          {auctionData?.title?.rendered || 'აუქციონის სახელი'}
        </span>
        <div className="w-11/12 flex justify-between items-center">
          <div className="w-1/3 flex items-center gap-2">
            <img src={DateIcon} alt="Date icon" />
            <span>{lastBid ? formatDate(lastBid.bid_time) : 'თარიღი არ არის'}</span>
          </div>

          <div className="w-1/3 flex items-center gap-2">
            <span className="font-bold">ბიდის ავტორი: </span>
            <span>{lastBid?.author_name || 'უცნობი'}</span>
          </div>

          <div className="w-1/3 flex items-center gap-2">
            <span className="font-bold">ბიდის ფასი: </span>
            <span>{lastBid ? `${lastBid.bid_price} ₾` : '0 ₾'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndedLostAuction;