import React, { useEffect } from 'react';
import AuctionCategoryItems from '../components/auction/AuctionCategoryItems';
import InstructionItems from '../components/content/InstructionItems';
import TheatreCinemaCarousel from '../components/auction/AuctionCarousels/TheatreCinemaCarousel';
import EventsCarousel from '../components/auction/AuctionCarousels/EventsCarousel';
import SportCarousel from '../components/auction/AuctionCarousels/SportCarousel';
import TravelCarousel from '../components/auction/AuctionCarousels/TravelCarousel';

const HomePage = () => {
  useEffect(() => {
    document.title = 'მთავარი';
  }, []);

  return (
    <div className='w-full bg-[#E6E6E6] px-4 md:px-8 lg:px-16 flex flex-col gap-8 md:gap-12 py-10 md:py-20'>
      <AuctionCategoryItems />
      <TheatreCinemaCarousel />
      <InstructionItems />
      <EventsCarousel />
      <SportCarousel />
      <TravelCarousel />
    </div>
  );
};

export default HomePage;