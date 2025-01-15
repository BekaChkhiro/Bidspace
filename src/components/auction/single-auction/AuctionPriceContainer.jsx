import React, { useState, useEffect, useRef } from 'react';

const AuctionPriceContainer = ({ auction }) => {
  const [currentPrice, setCurrentPrice] = useState(auction.meta?.auction_price);
  const [isPriceUpdated, setIsPriceUpdated] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const previousPrice = useRef(auction.meta?.auction_price);

  useEffect(() => {
    const checkPrice = async () => {
      try {
        const response = await fetch(`/wp-json/bidspace/v1/auction/${auction.id}/current-price`);
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.price !== previousPrice.current) {
          setCurrentPrice(data.price);
          setIsPriceUpdated(true);
          previousPrice.current = data.price;
          
          setTimeout(() => {
            setIsPriceUpdated(false);
          }, 500);
        }
      } catch (error) {
        console.error('ფასის შემოწმების შეცდომა:', error);
      }
    };

    const intervalId = setInterval(checkPrice, 2000);

    const timeIntervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timeIntervalId);
    };
  }, [auction.id]);

  const isAuctionStarted = () => {
    const tbilisiTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    const auctionStartTime = new Date(auction.meta?.start_time); // შევცვალეთ start_date -> start_time
    
    console.log('თბილისის დრო:', tbilisiTime);
    console.log('აუქციონის დაწყების დრო:', auctionStartTime);
    console.log('აუქციონის start_time:', auction.meta?.start_time);
    
    return tbilisiTime >= auctionStartTime;
  };

  const auctionStarted = isAuctionStarted();

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .pulse-animation {
            animation: pulse 0.5s ease-in-out;
          }
        `}
      </style>

      <div className="flex flex-wrap sm:flex-row gap-2 sm:gap-4 justify-between">
        {/* Top row container for mobile */}
        <div className="w-full flex justify-between sm:hidden">
          <div className="flex flex-col items-start gap-0.5 shrink-0 w-[120px]">
            <span className="text-[12px] font-bold whitespace-nowrap">ბილეთის ფასი</span>
            <span className="text-[14px] font-normal whitespace-nowrap">{auction.meta?.ticket_price}₾</span>
          </div>

          <div className="flex flex-col items-start gap-0.5 shrink-0 w-[120px]">
            <span className="text-[12px] font-bold whitespace-nowrap">მიმდინარე ფასი</span>
            <span 
              className={`text-[14px] font-normal whitespace-nowrap ${isPriceUpdated ? 'pulse-animation' : ''}`}
              style={{ color: '#00AEEF' }}
            >
              {currentPrice}₾
            </span>
          </div>
        </div>

        {/* Desktop version (hidden on mobile) */}
        <div className="hidden sm:flex flex-col items-start gap-2 shrink-0 w-[120px] md:w-auto">
          <span className="text-[10px] md:text-lg font-bold whitespace-nowrap">ბილეთის ფასი</span>
          <span className="text-[12px] md:text-lg font-normal whitespace-nowrap">{auction.meta?.ticket_price}₾</span>
        </div>

        <div className="hidden sm:flex flex-col items-start gap-2 shrink-0 w-[120px] md:w-auto">
          <span className="text-[10px] md:text-lg font-bold whitespace-nowrap">მიმდინარე ფასი</span>
          <span 
            className={`text-[12px] md:text-lg font-normal whitespace-nowrap ${isPriceUpdated ? 'pulse-animation' : ''}`}
            style={{ color: '#00AEEF' }}
          >
            {currentPrice}₾
          </span>
        </div>

        {/* Bottom element (full width on mobile) */}
        <div className="w-full sm:w-[120px] flex flex-col items-start gap-0.5 sm:gap-2 shrink-0 md:w-auto">
          <span className="text-[12px] sm:text-sm md:text-lg font-bold whitespace-nowrap">მომენტალურად ყიდვა</span>
          {auctionStarted ? (
            <span className="text-[14px] sm:text-sm md:text-lg font-normal whitespace-nowrap" style={{ color: '#FF0000' }}>
              არ აქვს
            </span>
          ) : (
            <span className="text-[14px] sm:text-sm md:text-lg font-normal whitespace-nowrap" style={{ color: '#00AEEF' }}>
              {auction.meta?.buy_now}₾
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default AuctionPriceContainer;