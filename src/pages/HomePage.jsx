import React, { useEffect } from 'react';
import AuctionCategoryItems from '../components/auction/AuctionCategoryItems';
import InstructionItems from '../components/content/InstructionItems';
import AuctionArchive from '../components/auction/AuctionArchive';
import TheatreCinemaCarousel from '../components/auction/AuctionCarousels/TheatreCinemaCarousel';

const HomePage = () => {
  useEffect(() => {
    document.title = 'მთავარი';
  }, []);

  return (
    <div className='w-full bg-[#E6E6E6] px-4 md:px-8 lg:px-16 flex flex-col gap-8 md:gap-12 py-10 md:py-20'>
      <AuctionCategoryItems />
      <TheatreCinemaCarousel />
      <AuctionArchive />
      <InstructionItems />
    </div>
  );
};

export default HomePage;