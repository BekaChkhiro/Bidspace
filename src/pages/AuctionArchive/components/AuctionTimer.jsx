import React, { useState, useEffect } from 'react';

export const AuctionTimer = ({ endDate, texts }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endDateTime = new Date(endDate).getTime();
      const distance = endDateTime - now;

      if (distance < 0) {
        setIsExpired(true);
        return;
      }

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (isExpired) {
    return <p className="text-lg font-bold mb-4">{texts.auctionEnded}</p>;
  }

  return (
    <div className="w-full flex justify-center items-center gap-2 text-center">
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{days}</span>
        <span className="text-sm">{texts.days}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{hours}</span>
        <span className="text-sm">{texts.hours}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{minutes}</span>
        <span className="text-sm">{texts.minutes}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{seconds}</span>
        <span className="text-sm">{texts.seconds}</span>
      </span>
    </div>
  );
};
