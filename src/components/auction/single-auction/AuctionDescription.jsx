import React from 'react';

const AuctionDescription = ({ auction }) => {
  const formatGeorgianDate = (dateString) => {
    const date = new Date(dateString);
    
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბრი', 'დეკემბრი'
    ];

    const day = date.getDate();
    const month = georgianMonths[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  const renderCategoryDetails = () => {
    const DetailRow = ({ label, value, important }) => (
      <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200 rounded-sm px-2">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-semibold ${important ? 'text-blue-600' : 'text-gray-800'}`}>
          {value}
        </span>
      </div>
    );

    const commonFields = (
      <>
        <DetailRow 
          label="კატეგორია" 
          value={auction.meta?.ticket_category} 
          important={true}
        />
        <DetailRow 
          label="ქალაქი" 
          value={auction.meta?.city || 'არ არის მითითებული'}
        />
        <DetailRow 
          label="დაწყების თარიღი" 
          value={auction.meta?.start_date ? formatGeorgianDate(auction.meta.start_date) : 'არ არის მითითებული'}
          important={true}
        />
        <DetailRow 
          label="ბილეთის ფასი" 
          value={`${auction.meta?.ticket_price || 0}₾`}
          important={true}
        />
        <DetailRow 
          label="ბილეთების რაოდენობა" 
          value={auction.meta?.ticket_quantity || 0}
        />
      </>
    );

    const renderAdditionalDetails = () => {
      switch (auction.meta?.ticket_category) {
        case 'თეატრი-კინო':
          return (
            <>
              <DetailRow 
                label="დარბაზი" 
                value={auction.meta?.hall || 'არ არის მითითებული'}
              />
              <DetailRow 
                label="რიგი" 
                value={auction.meta?.row || 'არ არის მითითებული'}
              />
              <DetailRow 
                label="ადგილი" 
                value={auction.meta?.place || 'არ არის მითითებული'}
              />
            </>
          );
        case 'სპორტი':
          return (
            <>
              <DetailRow 
                label="სექტორი" 
                value={auction.meta?.sector || 'არ არის მითითებული'}
              />
              <DetailRow 
                label="რიგი" 
                value={auction.meta?.row || 'არ არის მითითებული'}
              />
              <DetailRow 
                label="ადგილი" 
                value={auction.meta?.place || 'არ არის მითითებული'}
              />
            </>
          );
        default:
          return null;
      }
    };

    const additionalDetails = renderAdditionalDetails();

    return (
      <div className="space-y-2">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {commonFields}
        </div>
        {additionalDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              დამატებითი დეტალები
            </h4>
            {additionalDetails}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            აუქციონის დეტალები
          </h3>
        </div>
        <div>
          {renderCategoryDetails()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            აღწერა
          </h3>
        </div>
        <div className="p-6 prose prose-gray max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: auction.content?.rendered || 
            '<p className="text-gray-500 italic">აღწერა არ არის</p>' 
          }} />
        </div>
      </div>
    </div>
  );
};

export default AuctionDescription;