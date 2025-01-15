import React from 'react';
import lostAuctionIcon from '../../assets/icons/auction/ended_lost_auction.svg';
import dateIcon from '../../assets/icons/auction/date_icon.svg';

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
    <div className="w-full flex flex-col py-4 sm:py-6 gap-4 sm:gap-6">
      <div className="flex justify-center items-center gap-3 sm:gap-6 px-2 sm:px-0">
        <img src={lostAuctionIcon} alt="Auction ended icon" className="w-8 h-8 sm:w-auto sm:h-auto" />
        <span className="font-normal text-base sm:text-lg text-[#FF0101]">აუქციონი დასრულდა!</span>
      </div>

      <div className="w-full border-y p-3 sm:p-6 flex flex-col items-center gap-4 sm:gap-6">
        <span className="w-full sm:w-11/12 font-bold text-base sm:text-lg px-2 sm:px-0">
          {auctionData?.title?.rendered || 'აუქციონის სახელი'}
        </span>
        <div className="w-full sm:w-11/12 grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-0 sm:justify-between items-start sm:items-center px-2 sm:px-0">
          <div className="col-span-2 sm:col-span-1 sm:w-1/3 flex items-center gap-2">
            <img src={dateIcon} alt="Date icon" className="w-4 h-4 sm:w-auto sm:h-auto" />
            <span className="text-sm sm:text-base">{lastBid ? formatDate(lastBid.bid_time) : 'თარიღი არ არის'}</span>
          </div>

          <div className="sm:w-1/3 flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base">ბიდის ავტორი: </span>
            <span className="text-sm sm:text-base">{lastBid?.author_name || 'უცნობი'}</span>
          </div>

          <div className="sm:w-1/3 flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base">ბიდის ფასი: </span>
            <span className="text-sm sm:text-base">{lastBid ? `${lastBid.bid_price} ₾` : '0 ₾'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndedLostAuction;