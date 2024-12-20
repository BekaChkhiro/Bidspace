import React, { useState, useEffect, useRef } from 'react';

const ActiveAuctionTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [currentEndDate, setCurrentEndDate] = useState(endDate);
  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentEndDate(endDate);
  }, [endDate]);

  useEffect(() => {
    const handleAuctionUpdate = (event) => {
      if (event.detail?.newTime) {
        setCurrentEndDate(event.detail.newTime);
      }
    };

    document.addEventListener('auctionTimeUpdated', handleAuctionUpdate);
    return () => document.removeEventListener('auctionTimeUpdated', handleAuctionUpdate);
  }, []);

  const calculateTimeLeft = () => {
    const now = Date.parse(new Date().toLocaleString("en-US", {timeZone: "Asia/Tbilisi"}));
    const target = Date.parse(new Date(currentEndDate).toLocaleString("en-US", {timeZone: "Asia/Tbilisi"}));
    const difference = target - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      // თუ 30 წამი ან ნაკლებია დარჩენილი
      if (difference / 1000 <= 30) {
        document.dispatchEvent(new CustomEvent('auctionLastMinutes', {
          detail: { secondsLeft: Math.floor(difference / 1000) }
        }));
      }
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  useEffect(() => {
    calculateTimeLeft();
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentEndDate]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="w-full flex gap-4 justify-center text-center">
      <div className="w-1/4 bg-blue-100 p-3 rounded-lg min-w-[80px]">
        <div className="text-2xl font-bold">{formatNumber(timeLeft.days)}</div>
        <div className="text-sm">დღე</div>
      </div>
      <div className="w-1/4 bg-blue-100 p-3 rounded-lg min-w-[80px]">
        <div className="text-2xl font-bold">{formatNumber(timeLeft.hours)}</div>
        <div className="text-sm">საათი</div>
      </div>
      <div className="w-1/4 bg-blue-100 p-3 rounded-lg min-w-[80px]">
        <div className="text-2xl font-bold">{formatNumber(timeLeft.minutes)}</div>
        <div className="text-sm">წუთი</div>
      </div>
      <div className="w-1/4 bg-blue-100 p-3 rounded-lg min-w-[80px]">
        <div className="text-2xl font-bold">{formatNumber(timeLeft.seconds)}</div>
        <div className="text-sm">წამი</div>
      </div>
    </div>
  );
};

export default ActiveAuctionTimer;