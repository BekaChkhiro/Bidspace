import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { AuctionTimer } from './AuctionTimer';

const AuctionItem = ({ 
  auction, 
  texts, 
  wishlist, 
  onWishlistToggle,
  getFeaturedImageUrl,
  handleImageError
}) => {
  const getBadgeStyle = (auction) => {
    const now = Date.now();
    const startTime = new Date(auction.meta.start_time).getTime();
    const endTime = new Date(auction.meta.due_time).getTime();

    if (startTime > now) {
      return { backgroundColor: '#FF5733' };
    } else if (endTime > now) {  
      return { backgroundColor: '#19B200' };
    } else {
      return { backgroundColor: '#848484' };
    }
  };

  const getAuctionStatus = (auction) => {
    const now = Date.now();
    const startTime = new Date(auction.meta.start_time).getTime();
    const endTime = new Date(auction.meta.due_time).getTime();
    
    if (startTime > now) {
      return 'იწყება';
    } else if (endTime > now) {
      return 'აქტიური';
    } else {
      return 'დასრულებული';
    }
  };

  const getAuctionLink = (auctionId) => {
    return `/auction/${auctionId}`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between">
      <Link to={getAuctionLink(auction.id)} className="flex flex-col gap-4">
        <div className="relative" style={{ height: '180px' }}>
          <img
            src={getFeaturedImageUrl(auction)}
            alt={auction.title.rendered}  
            className="w-full h-full object-cover rounded-xl"
            onError={handleImageError}
          />
          <div 
            className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-sm" 
            style={getBadgeStyle(auction)}
          >
            {getAuctionStatus(auction)}
          </div>
        </div>
        <div className="flex justify-between gap-6 items-center">
          <h4 className="text-lg font-bold" dangerouslySetInnerHTML={{ __html: auction.title.rendered }}></h4>
          <button 
            onClick={(e) => onWishlistToggle(e, auction.id)}
            className="focus:outline-none transition-transform duration-200 hover:scale-110"
          >
            {wishlist.includes(Number(auction.id)) ? (
              <FaHeart className="w-6 h-6 text-black" />
            ) : (
              <FaRegHeart className="w-6 h-6 text-gray-500 hover:text-black" />
            )}
          </button>
        </div>
        <div className="flex justify-between gap-6 items-center">
          <div className="w-1/2 flex flex-col items-start">
            <h5 className="text-black font-normal text-lg">{texts.ticketPrice}</h5>
            <span className="text-black font-normal text-lg">{auction.meta.ticket_price} {texts.currency}</span>
          </div>
          <div className="w-1/2 flex flex-col items-start">  
            <h5 className="text-black font-normal text-lg">{texts.currentPrice}</h5>
            <span className="text-black font-normal text-lg" style={{color: '#00AEEF'}}>
              {auction.meta.auction_price} {texts.currency}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center my-4">
          {new Date(auction.meta.start_time).getTime() > Date.now() ? (
            <>
              <p className="text-lg font-bold mb-4">{texts.auctionWillStart}</p>
              <AuctionTimer endDate={auction.meta.start_time} texts={texts} />
            </>
          ) : new Date(auction.meta.due_time).getTime() > Date.now() ? (
            <>
              <p className="text-lg font-bold mb-4">{texts.auctionWillEnd}</p>
              <AuctionTimer endDate={auction.meta.due_time} texts={texts} />
            </>
          ) : (
            <p className="text-lg font-bold mb-4">{texts.auctionEnded}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Link 
            to={getAuctionLink(auction.id)} 
            className="w-full p-3 text-white text-center rounded-full" 
            style={{ backgroundColor: '#00AEEF' }}
          >
            {texts.placeBid}
          </Link>
          <Link
            to={getAuctionLink(auction.id)}  
            className="w-full p-3 text-center rounded-full"
            style={{ backgroundColor: '#E6E6E6' }}
          >
            {texts.buyNow} {auction.meta.buy_now}{texts.currency}
          </Link>
        </div>
      </Link>
    </div>
  );
};

export default AuctionItem;
