import React, { useEffect } from 'react';
import AuctionCategoryItems from '../components/AuctionCategoryItems';
import InstructionItems from '../components/InstructionItems';
import AuctionArchive from '../components/AuctionArchive';
import ActiveAuctionCarousel from '../components/AuctionCarousels/ActiveAuctionCarousel';
import TheatreCinemaCarousel from '../components/AuctionCarousels/TheatreCinemaCarousel';
import EventCarousel from '../components/AuctionCarousels/EventCarousel';

const HomePage = () => {
  useEffect(() => {
    document.title = 'მთავარი';
  }, []);

  return (
    <div className='w-full bg-[#E6E6E6] px-4 md:px-8 lg:px-16 flex flex-col gap-8 md:gap-12 py-10 md:py-20'>
      <AuctionCategoryItems />
      <ActiveAuctionCarousel />
      <TheatreCinemaCarousel />
      <EventCarousel />
      <AuctionArchive />
      <InstructionItems />
    </div>
  );
};

export default HomePage;