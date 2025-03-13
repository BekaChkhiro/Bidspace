import React from 'react';

const AuctionDescription = ({ auction }) => {
  const formatGeorgianDate = (dateString) => {
    const date = new Date(dateString);
    
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ];

    const day = date.getDate();
    const month = georgianMonths[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">დაწყების თარიღი:</span>
          <span className="font-medium">
            {formatGeorgianDate(auction.meta?.start_time)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">ბილეთის ფასი:</span>
          <span className="font-medium">{auction.meta?.ticket_price || 0}₾</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ბილეთების რაოდენობა:</span>
          <span className="font-medium">{auction.meta?.ticket_quantity || 0}</span>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: auction.content?.rendered || 'აღწერა არ არის' }} />
    </div>
  );
};

export default AuctionDescription;