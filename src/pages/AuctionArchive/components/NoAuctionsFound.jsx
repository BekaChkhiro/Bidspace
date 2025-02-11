import React from 'react';
import NotFoundImage from '../../../assets/images/auctions-no-result-img.webp';

const NoAuctionsFound = ({ message = "აუქციონები ვერ მოიძებნა" }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 gap-6">
        <img src={NotFoundImage} className='w-1/5' alt="not found image" />
      <div className="text-black text-center">
        <p className="text-xl font-medium">{message}</p>
      </div>
    </div>
  );
};

export default NoAuctionsFound;