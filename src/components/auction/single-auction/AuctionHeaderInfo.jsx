import React from 'react';

const AuctionHeaderInfo = ({ authorName, city, startTime }) => {
  // სახელის პირველი ასოს მიღების ფუნქცია
  const getInitial = () => {
    return authorName ? authorName.charAt(0).toUpperCase() : '?';
  };

  // თარიღის ფორმატირების ფუნქცია
  const formatDate = (dateString) => {
    if (!dateString) return 'თარიღი არ არის მითითებული';
    
    const date = new Date(dateString);
    // პადინგის ფუნქცია ერთნიშნა რიცხვებისთვის
    const pad = (num) => num.toString().padStart(2, '0');
    
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // getMonth() აბრუნებს 0-11
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-row justify-start sm:justify-between items-center gap-3 sm:gap-6 overflow-x-auto">
      {/* ავტორის ინფორმაცია */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 sm:w-10 h-7 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm sm:text-base">
          {getInitial()}
        </div>
        <span className="font-medium text-xs sm:text-base text-gray-800 whitespace-nowrap">
          {authorName || 'უცნობი'}
        </span>
      </div>

      {/* გამყოფი ხაზი */}
      <div className="h-5 w-px bg-gray-200 shrink-0" />

      {/* ქალაქი */}
      <div className="flex items-center gap-2 text-gray-600 shrink-0">
        <svg
          className="w-4 sm:w-5 h-4 sm:h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
        </svg>
        <span className="text-xs sm:text-base whitespace-nowrap">{city || 'ქალაქი არ არის'}</span>
      </div>

      {/* გამყოფი ხაზი */}
      <div className="h-5 w-px bg-gray-200 shrink-0" />

      {/* თარიღი */}
      <div className="flex items-center gap-2 text-gray-600 shrink-0">
        <svg 
          className="w-4 sm:w-5 h-4 sm:h-5" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-xs sm:text-base whitespace-nowrap">{formatDate(startTime)}</span>
      </div>
    </div>
  );
};

export default AuctionHeaderInfo;