import React from 'react';

const ActiveFilters = ({ filters, dateFilter, onRemoveFilter, onRemoveDateFilter }) => {
  const cityLabels = {
    tbilisi: 'თბილისი',
    batumi: 'ბათუმი',
    kutaisi: 'ქუთაისი',
    skhva_qalaqebi: 'სხვა ქალაქები',
    sazgvargaret: 'საზღვარგარეთ'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ka-GE');
  };

  const getFilterLabel = (type, filter) => {
    switch(type) {
      case 'city':
        return cityLabels[filter];
      case 'auctionPrice':
        return `აუქციონის ფასი: ${filter.min} - ${filter.max === Infinity ? '1000+' : filter.max}₾`;
      case 'buyNow':
        return `შესყიდვის ფასი: ${filter.min} - ${filter.max === Infinity ? '1000+' : filter.max}₾`;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Date Filter */}
      {dateFilter && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
          <span>{`${formatDate(dateFilter.from)} - ${formatDate(dateFilter.to)}`}</span>
          <button
            onClick={() => onRemoveDateFilter()}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Filters */}
      {Object.entries(filters).map(([key, value]) => {
        if (!value || (typeof value === 'object' && !value.min)) return null;
        
        return (
          <div key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
            <span>{getFilterLabel(key, value)}</span>
            <button
              onClick={() => onRemoveFilter(key)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveFilters;
