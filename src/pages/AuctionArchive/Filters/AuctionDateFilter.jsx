import React, { useState, useEffect, useRef } from 'react';

const AuctionDateFilter = ({ onDateFilterChange }) => {
  const filterRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(() => {
    const savedFilter = localStorage.getItem('auctionDateFilter');
    if (savedFilter) {
      const parsed = JSON.parse(savedFilter);
      return {
        from: new Date(parsed.from),
        to: new Date(parsed.to)
      };
    }
    return null;
  });
  const [dateRange, setDateRange] = useState(() => {
    if (selectedRange) {
      return {
        from: new Date(selectedRange.from),
        to: new Date(selectedRange.to)
      };
    }
    return {
      from: null,
      to: null
    };
  });
  const [activeMonths, setActiveMonths] = useState([selectedRange?.from || new Date()]);
  const [activeDates, setActiveDates] = useState([]); // Make sure this is declared

  // Add new useEffect for handling month change on open
  useEffect(() => {
    if (isOpen && selectedRange?.from) {
      setActiveMonths([new Date(selectedRange.from)]);
    }
  }, [isOpen, selectedRange]);

  useEffect(() => {
    if (activeMonths[0]) { // Add check to ensure activeMonths exists
      fetchActiveDates();
    }
  }, [activeMonths]);

  // Add new useEffect to sync dateRange with selectedRange when popup opens
  useEffect(() => {
    if (isOpen && selectedRange) {
      setDateRange({
        from: new Date(selectedRange.from),
        to: new Date(selectedRange.to)
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  const monthNames = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];
  
  const dayNames = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
      .toString().padStart(2, '0')}.${date.getFullYear()}`;
  }

  function generateCalendarDays(date) {
    const days = [];
    const totalDays = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }

  function isInRange(date, monthIndex) {
    if (!dateRange.from || !dateRange.to) return false;
    
    const currentDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      date
    );
    return dateRange.from <= currentDate && currentDate <= dateRange.to;
  }

  function isStartDate(date, monthIndex) {
    if (!dateRange.from) return false;
    const currentDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      date
    );
    return currentDate.getTime() === dateRange.from.getTime();
  }

  function isEndDate(date, monthIndex) {
    if (!dateRange.to) return false;
    const currentDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      date
    );
    const endDate = new Date(dateRange.to);
    
    return currentDate.getFullYear() === endDate.getFullYear() &&
           currentDate.getMonth() === endDate.getMonth() &&
           currentDate.getDate() === endDate.getDate();
  }

  const fetchActiveDates = async () => {
    try {
      const startDate = new Date(activeMonths[0].getFullYear(), activeMonths[0].getMonth(), 1);
      const endDate = new Date(activeMonths[0].getFullYear(), activeMonths[0].getMonth() + 1, 0);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      
      try {
        const response = await fetch(`/wp-json/wp/v2/auction?_fields=start_date&per_page=100&after=${formattedStartDate}&before=${formattedEndDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Response was not JSON");
        }
        
        const auctions = await response.json();
        const dates = auctions.map(auction => {
          const date = new Date(auction.start_date);
          date.setHours(0, 0, 0, 0);
          return date.toISOString().split('T')[0];
        });
        setActiveDates([...new Set(dates)]);
      } catch (error) {
        console.error('Error parsing response:', error);
        setActiveDates([]); // Reset to empty array on error
      }
    } catch (error) {
      console.error('Error fetching active dates:', error);
      setActiveDates([]); // Reset to empty array on error
    }
  };

  const isActiveDate = (day, monthIndex) => {
    if (!day || !activeDates) return false; // Add null check
    const currentDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      day
    ).toISOString().split('T')[0];
    return activeDates.includes(currentDate);
  };

  function handleDateClick(day, monthIndex) {
    if (!day) return;

    const clickedDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      day
    );

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: clickedDate, to: null });
    } else {
      if (clickedDate < dateRange.from) {
        setDateRange({ from: clickedDate, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: clickedDate });
      }
    }
  }

  function handleMonthNavigation(direction) {
    const newMonth = addMonths(activeMonths[0], direction);
    setActiveMonths([newMonth]);
  }

  const handleClear = () => {
    setDateRange({
      from: null,
      to: null
    });
    setSelectedRange(null);
    onDateFilterChange(null);
    localStorage.removeItem('auctionDateFilter');
    setIsOpen(false);
  };

  const handleFilter = () => {
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      
      const filter = {
        from: from.toISOString(),
        to: to.toISOString()
      };
      
      setSelectedRange({
        from: new Date(from),
        to: new Date(to)
      });
      onDateFilterChange(filter);
      
      localStorage.setItem('auctionDateFilter', JSON.stringify(filter));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={filterRef}>
      <button
        className={`flex items-center justify-between gap-3 px-5 py-2.5 border border-gray-200 
        rounded-full bg-white hover:border-gray-300 transition-colors duration-200 
        ${selectedRange ? 'w-56' : 'w-52'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="text-sm text-gray-700">
          {selectedRange ? 
            `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}` : 
            "აირჩიეთ თარიღი"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-5 bg-white rounded-xl shadow-lg shadow-gray-200/70 z-50 w-[320px]
          border border-gray-100 transform transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1">
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => handleMonthNavigation(-1)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <span className="font-medium text-gray-800">
                {monthNames[activeMonths[0].getMonth()]} 2024
              </span>
              <div className="flex items-center gap-1">
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => handleMonthNavigation(1)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(activeMonths[0]).map((day, dayIndex) => {
                const isWeekend = (dayIndex + 1) % 7 === 0 || dayIndex % 7 === 0;
                const hasEvent = isActiveDate(day, 0);
                return (
                  <div
                    key={dayIndex}
                    className={`
                      relative flex items-center justify-center h-9 text-sm
                      transition-all duration-200 rounded-lg
                      ${!day ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:bg-gray-50'}
                      ${isWeekend && !isStartDate(day, 0) && !isEndDate(day, 0) ? 'text-red-500' : ''}
                      ${day && isStartDate(day, 0) ? 'bg-gray-900 !text-white hover:bg-black' : ''}
                      ${day && isEndDate(day, 0) ? 'bg-gray-900 !text-white hover:bg-black' : ''}
                      ${day && isInRange(day, 0) && !isStartDate(day, 0) && !isEndDate(day, 0) 
                        ? 'bg-gray-100 text-gray-700' : 'text-gray-700'}
                    `}
                    onClick={() => handleDateClick(day, 0)}
                  >
                    {day}
                    {hasEvent && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 
                        bg-red-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="w-full flex justify-center items-center gap-2 text-sm text-gray-600">
              {dateRange.from && dateRange.to && (
                <span className='text-lg'>
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </span>
              )}
            </div>
            <div className="w-full justify-between items-center flex gap-2">
              <button 
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 
                  hover:bg-gray-50 transition-colors duration-200"
                onClick={handleClear}
              >
                გაუქმება
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg text-white transition-colors duration-200
                  ${dateRange.from && dateRange.to 
                    ? 'bg-black hover:bg-gray-800 cursor-pointer' 
                    : 'bg-gray-200 cursor-not-allowed'}`}
                onClick={handleFilter}
                disabled={!dateRange.from || !dateRange.to}
              >
                ფილტრი
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDateFilter;