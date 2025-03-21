import React, { useState } from 'react';
import wonAuctionIcon from '../../assets/icons/auction/won_auction.svg';
import dateIcon from '../../assets/icons/auction/date_icon.svg';
import paymentArrowIcon from '../../assets/icons/auction/payment_arrow.svg';

const EndedWonAuction = ({ auctionData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Check if payment is already completed
      if (auctionData.meta?.payment_status === 'completed') {
        setError('გადახდა უკვე განხორციელებულია');
        return;
      }

      // Initiate payment
      const response = await fetch('/wp-json/bidspace/v1/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings?.restNonce || '',
        },
        body: JSON.stringify({
          auction_id: auctionData.id,
          amount: lastBid?.bid_price || 0
        })
      });

      if (!response.ok) {
        throw new Error('გადახდის ინიციალიზაცია ვერ მოხერხდა');
      }

      const data = await response.json();

      // Redirect to BOG payment page
      if (data.links && data.links.redirect) {
        window.location.href = data.links.redirect;
      } else {
        throw new Error('გადახდის ბმული ვერ მოიძებნა');
      }
    } catch (err) {
      setError(err.message || 'გადახდის დროს დაფიქსირდა შეცდომა');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
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
            <button 
              className='flex items-center gap-1 sm:gap-2 disabled:opacity-50'
              onClick={handlePayment}
              disabled={isProcessing || auctionData.meta?.payment_status === 'completed'}
            >
              <span className="font-bold text-[10px] sm:text-base text-[#00a9eb] whitespace-nowrap">
                {isProcessing ? 'იტვირთება...' : 'გადახდა'}
              </span>
              <img src={paymentArrowIcon} alt='payment icon' className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default EndedWonAuction;