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

      <div className="flex gap-4 justify-between">
        <div className="w-3/12 flex flex-col items-start gap-2">
          <span className="text-lg font-bold">ბილეთის ფასი</span>
          <span className="text-lg font-normal">{auction.meta?.ticket_price} ლარი</span>
        </div>

        <div className="w-3/12 flex flex-col items-start gap-2">
          <span className="text-lg font-bold">მიმდინარე ფასი</span>
          <span 
            className={`text-lg font-normal ${isPriceUpdated ? 'pulse-animation' : ''}`}
            style={{ color: '#00AEEF' }}
          >
            {currentPrice} ლარი
          </span>
        </div>

        <div className="w-4/10 flex flex-col items-start gap-2">
          <span className="text-lg font-bold">მომენტალურად ყიდვა</span>
          {auctionStarted ? (
            <span className="text-lg font-normal" style={{ color: '#FF0000' }}>
              არ არის ხელმისაწვდომი
            </span>
          ) : (
            <span className="text-lg font-normal" style={{ color: '#00AEEF' }}>
              {auction.meta?.buy_now} ლარი
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default AuctionPriceContainer;