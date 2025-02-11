import React from 'react';
import AuctionDateFilter from '../Filters/AuctionDateFilter';
import FilterPopup from './FilterPopup';
import ActiveFilters from './ActiveFilters';

const AuctionFilters = ({
  dateFilter,
  mainFilters,
  isFilterPopupOpen,
  onDateFilterChange,
  onFilterButtonClick,
  onFilterPopupClose,
  onFilterApply,
  onRemoveFilter,
  onRemoveDateFilter
}) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-row md:flex-row gap-4 md:items-center relative'>
        <div className="w-3/5 md:w-auto">
          <AuctionDateFilter 
            onDateFilterChange={onDateFilterChange}
            currentDateFilter={dateFilter}
          />
        </div>
        <div className="w-2/5 md:w-auto md:ml-auto">
          <button
            onClick={onFilterButtonClick}
            className="w-full md:w-auto min-w-[120px] px-6 py-2.5 text-xs md:text-sm rounded-full border border-[#D9D9D9] 
              bg-white text-gray-700 hover:bg-gray-50"
          >
            ფილტრი
          </button>
        </div>
        {isFilterPopupOpen && (
          <FilterPopup
            onClose={onFilterPopupClose}
            onApply={onFilterApply}
            currentFilters={mainFilters}
          />
        )}
      </div>
      
      {/* Active Filters */}
      {(dateFilter || Object.values(mainFilters).some(v => v && v.length !== 0 || (typeof v === 'object' && v.min))) && (
        <ActiveFilters
          filters={mainFilters}
          dateFilter={dateFilter}
          onRemoveFilter={onRemoveFilter}
          onRemoveDateFilter={onRemoveDateFilter}
        />
      )}
    </div>
  );
};

export default AuctionFilters;