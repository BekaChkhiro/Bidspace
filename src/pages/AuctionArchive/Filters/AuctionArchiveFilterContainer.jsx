import React from 'react';
import AuctionDateFilter from './AuctionDateFilter';
import AuctionArchiveMainFilter from './AuctionArchiveMainFilter';

const AuctionArchiveFilterContainer = ({ onDateFilterChange, onMainFilterChange }) => {
  return (
    <div>
      <div className='flex justify-between items-center'>
        <AuctionDateFilter onDateFilterChange={onDateFilterChange} />
        <AuctionArchiveMainFilter onFilterChange={onMainFilterChange} />
      </div>
    </div>
  );
};

export default AuctionArchiveFilterContainer;