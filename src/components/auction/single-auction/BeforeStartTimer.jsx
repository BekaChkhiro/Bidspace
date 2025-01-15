import React, { useState, useEffect } from 'react';

const BeforeStartTimer = ({ targetDate, buyNowPrice }) => {
  // დავლოგოთ მიღებული props
  console.log('BeforeStartTimer received props:', { targetDate, buyNowPrice });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.parse(new Date().toLocaleString("en-US", {timeZone: "Asia/Tbilisi"}));
      const target = Date.parse(new Date(targetDate).toLocaleString("en-US", {timeZone: "Asia/Tbilisi"}));
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  // მხოლოდ მაშინ ვაჩვენოთ ფასი, როცა ის არსებობს
  const buttonText = buyNowPrice 
    ? `მომენტალურად ყიდვა ${buyNowPrice}₾` 
    : 'მომენტალურად ყიდვა';

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="w-full flex gap-2 sm:gap-4 justify-center text-center">
        <div className="w-1/4 bg-blue-100 p-2 sm:p-3 rounded-lg min-w-[60px] sm:min-w-[80px]">
          <div className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs sm:text-sm">დღე</div>
        </div>
        <div className="w-1/4 bg-blue-100 p-2 sm:p-3 rounded-lg min-w-[60px] sm:min-w-[80px]">
          <div className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs sm:text-sm">საათი</div>
        </div>
        <div className="w-1/4 bg-blue-100 p-2 sm:p-3 rounded-lg min-w-[60px] sm:min-w-[80px]">
          <div className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs sm:text-sm">წუთი</div>
        </div>
        <div className="w-1/4 bg-blue-100 p-2 sm:p-3 rounded-lg min-w-[60px] sm:min-w-[80px]">
          <div className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.seconds)}</div>
          <div className="text-xs sm:text-sm">წამი</div>
        </div>
      </div>
      
      <button
        className="w-full py-2 sm:py-3 bg-[#00AEEF] text-white rounded-full text-base sm:text-lg transition-colors"
        onClick={() => alert('ეს ფუნქცია ჯერ არ არის აქტიური')}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default BeforeStartTimer;