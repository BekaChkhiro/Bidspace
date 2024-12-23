import React, { useState, useEffect, useCallback } from 'react';

const AuctionDateFilter = ({ onDateFilterChange }) => {
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
  const [dateRange, setDateRange] = useState({
    from: selectedRange?.from || null,
    to: selectedRange?.to || null
  });
  const [activeMonths, setActiveMonths] = useState([new Date(), addMonths(new Date(), 1)]);
  const [activeDates, setActiveDates] = useState([]);

  const fetchActiveDates = useCallback(async () => {
    try {
      const startDate = new Date(activeMonths[0].getFullYear(), activeMonths[0].getMonth(), 1);
      const endDate = new Date(activeMonths[1].getFullYear(), activeMonths[1].getMonth() + 1, 0);
      
      const response = await fetch(
        `/wp-json/wp/v2/auction?_fields=start_date&per_page=100&after=${startDate.toISOString()}&before=${endDate.toISOString()}`
      );
      if (response.ok) {
        const auctions = await response.json();
        const dates = auctions.map(auction => new Date(auction.start_date).toISOString().split('T')[0]);
        setActiveDates([...new Set(dates)]);
      }
    } catch (error) {
      console.error('Error fetching active dates:', error);
    }
  }, [activeMonths]);

  useEffect(() => {
    fetchActiveDates();
  }, [fetchActiveDates]);

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
    return currentDate.getTime() === dateRange.to.getTime();
  }

  const isActiveDate = useCallback((day, monthIndex) => {
    if (!day) return false;
    const currentDate = new Date(
      activeMonths[monthIndex].getFullYear(),
      activeMonths[monthIndex].getMonth(),
      day
    ).toISOString().split('T')[0];
    return activeDates.includes(currentDate);
  }, [activeDates, activeMonths]);

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

  function handleMonthNavigation(direction, index) {
    const newMonths = [...activeMonths];
    newMonths[index] = addMonths(activeMonths[index], direction);
    
    // Ensure second month is always after first month
    if (index === 0 && newMonths[0] >= newMonths[1]) {
      newMonths[1] = addMonths(newMonths[0], 1);
    } else if (index === 1 && newMonths[1] <= newMonths[0]) {
      newMonths[0] = addMonths(newMonths[1], -1);
    }
    
    setActiveMonths(newMonths);
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
      
      onDateFilterChange({ from, to });
      setSelectedRange({ from, to });
      
      localStorage.setItem('auctionDateFilter', JSON.stringify({
        from: from.toISOString(),
        to: to.toISOString()
      }));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center justify-between gap-2 px-4 py-2 border rounded-full bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          selectedRange ? 'w-56' : 'w-52'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Open date filter"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>
          {selectedRange ? 
            `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}` : 
            "აირჩიეთ თარიღი"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-4 bg-white rounded-lg shadow-lg z-50 w-[500px]">
          <div className="flex gap-8 justify-between">
            {[0, 1].map((index) => (
              <div key={index} className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    onClick={() => handleMonthNavigation(-1, index)}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <span className="font-medium">
                    {activeMonths[index].getFullYear()} {monthNames[activeMonths[index].getMonth()]}
                  </span>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    onClick={() => handleMonthNavigation(1, index)}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium">
                      <span className={day === 'კვი' ? 'text-red-500' : ''}>
                        {day}
                      </span>
                    </div>
                  ))}
                  {generateCalendarDays(activeMonths[index]).map((day, dayIndex) => {
                    const isWeekend = (dayIndex + 1) % 7 === 0 || dayIndex % 7 === 0;
                    const hasEvent = isActiveDate(day, index);
                    return (
                      <button
                        key={dayIndex}
                        className={`
                          text-center p-2 relative focus:outline-none focus:ring-2 focus:ring-black
                          ${!day ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:bg-gray-50'}
                          ${isWeekend ? 'text-red-500' : ''}
                          ${day && isStartDate(day, index) ? 'bg-black text-white rounded-full' : ''}
                          ${day && isEndDate(day, index) ? 'bg-black text-white rounded-full' : ''}
                          ${day && isInRange(day, index) && !isStartDate(day, index) && !isEndDate(day, index) 
                            ? 'bg-gray-100' : ''}
                        `}
                        onClick={() => handleDateClick(day, index)}
                        disabled={!day}
                        aria-label={day ? `Select ${day}` : 'Empty day'}
                      >
                        {day}
                        {hasEvent && (
                          <div 
                            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {dateRange.from && dateRange.to && (
                <span>
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                className="px-6 py-2 rounded-full border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                onClick={handleClear}
              >
                გაუქმება
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${dateRange.from && dateRange.to 
                    ? 'bg-black hover:bg-gray-800 focus:ring-black cursor-pointer' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
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
