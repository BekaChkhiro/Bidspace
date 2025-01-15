import React from 'react';
import wonAuctionIcon from '../../assets/icons/auction/won_auction.svg';
import dateIcon from '../../assets/icons/auction/date_icon.svg';
import paymentArrowIcon from '../../assets/icons/auction/payment_arrow.svg';

const EndedWonAuction = ({ auctionData }) => {
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
        <img src={wonAuctionIcon} alt="Auction ended icon" className="w-8 h-8 sm:w-auto sm:h-auto" />
        <span className="font-normal text-sm sm:text-lg">გილოცავთ!</span>
      </div>

      <div className="w-full border-y p-3 sm:p-4 flex flex-col items-center gap-4 sm:gap-6">
        <span className="w-full font-bold text-sm sm:text-lg px-2 sm:px-0">
          {auctionData?.title?.rendered || 'აუქციონის სახელი'}
        </span>
        <div className="w-full flex flex-row overflow-x-auto gap-3 sm:gap-0 sm:justify-between items-center px-2 sm:px-0">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <img src={dateIcon} alt="Date icon" className="w-4 h-4 sm:w-auto sm:h-auto" />
            <span className="text-[10px] sm:text-base whitespace-nowrap">
              {lastBid ? formatDate(lastBid.bid_time).split(',')[0] : 'თარიღი არ არის'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-bold text-[10px] sm:text-base whitespace-nowrap">ავტორი: </span>
            <span className="text-[10px] sm:text-base whitespace-nowrap">{lastBid?.author_name || 'უცნობი'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-bold text-[10px] sm:text-base whitespace-nowrap">ფასი: </span>
            <span className="text-[10px] sm:text-base whitespace-nowrap">{lastBid ? `${lastBid.bid_price}₾` : '0₾'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button className='flex items-center gap-1 sm:gap-2'>
              <span className="font-bold text-[10px] sm:text-base text-[#00a9eb] whitespace-nowrap">გადახდა</span>
              <img src={paymentArrowIcon} alt='payment icon' className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndedWonAuction;