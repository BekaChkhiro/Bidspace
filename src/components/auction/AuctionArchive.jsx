import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SkeletonLoader = () => (
  <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between animate-pulse">
    {/* სურათის სკელეტონი */}
    <div className="relative h-[180px] bg-gray-200 rounded-xl">
      <div className="absolute top-2 left-2 w-16 h-6 bg-gray-300 rounded-full"/>
    </div>
    
    {/* სათაურის სკელეტონი */}
    <div className="flex justify-between gap-6 items-center mt-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"/>
      <div className="h-6 w-6 bg-gray-200 rounded-full"/>
    </div>
    
    {/* ფასების სკელეტონი */}
    <div className="flex justify-between gap-6 items-center mt-4">
      <div className="w-1/2">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"/>
        <div className="h-6 bg-gray-200 rounded w-2/3"/>
      </div>
      <div className="w-1/2">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"/>
        <div className="h-6 bg-gray-200 rounded w-2/3"/>
      </div>
    </div>
    
    {/* თაიმერის სკელეტონი */}
    <div className="flex flex-col items-center my-4">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"/>
      <div className="w-full flex justify-center items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1/4 flex flex-col p-2 rounded-xl bg-gray-100">
            <div className="h-6 bg-gray-200 rounded w-full mb-1"/>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"/>
          </div>
        ))}
      </div>
    </div>
    
    {/* ღილაკების სკელეტონი */}
    <div className="flex flex-col gap-3 mt-4">
      <div className="h-12 bg-gray-200 rounded-full"/>
      <div className="h-12 bg-gray-200 rounded-full"/>
    </div>
  </div>
);

const AuctionTimer = ({ endDate, texts }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endDateTime = new Date(endDate).getTime();
      const distance = endDateTime - now;

      if (distance < 0) {
        setIsExpired(true);
        return;
      }

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
    };

    // Initial call
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [endDate]); // Added endDate to dependencies

  if (isExpired) {
    return <p className="text-lg font-bold mb-4">{texts.auctionEnded}</p>;
  }

  return (
    <div className="w-full flex justify-center items-center gap-2 text-center">
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{days}</span>
        <span className="text-sm">{texts.days}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{hours}</span>
        <span className="text-sm">{texts.hours}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{minutes}</span>
        <span className="text-sm">{texts.minutes}</span>
      </span>
      <span className="w-1/4 flex flex-col p-2 rounded-xl" style={{ backgroundColor: '#e6e6e6' }}>
        <span className="text-lg font-bold">{seconds}</span>
        <span className="text-sm">{texts.seconds}</span>
      </span>
    </div>
  );
};

const AuctionArchive = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const texts = {
    auctionsTitle: "აუქციონები",
    loading: "იტვირთება...",
    imageLoading: "გამოსახულება იტვირთება...",
    ticketPrice: "ბილეთის ფასი",
    currentPrice: "მიმდინარე ფასი", 
    currency: "₾",
    auctionWillStart: "აუქციონი დაიწყება",
    auctionWillEnd: "აუქციონი დასრულდება",
    auctionEnded: "აუქციონი დასრულდა",
    days: "დღე",
    hours: "საათი",
    minutes: "წუთი",
    seconds: "წამი",
    noAuctionsFound: "აუქციონები ვერ მოიძებნა",
    placeBid: "განათავსე ბიდი",
    buyNow: "ახლავე ყიდვა"
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/auction?_embed&per_page=3&orderby=date&order=desc', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-Key': window.wpApiSettings?.apiKey || ''
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch auctions');
        }

        const data = await response.json();
        setAuctions(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auctions:', err);
        setError('აუქციონების ჩატვირთვისას მოხდა შეცდომა');
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const getFeaturedImageUrl = (auction) => {
    try {
      return auction._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.jpg';
    } catch (error) {
      return '/placeholder.jpg';
    }
  };

  const getAuctionLink = (auctionId) => {
    return `/auction/${auctionId}`;
  };

  const handleImageError = (event) => {
    event.target.src = '/placeholder.jpg';
  };

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

  const handleLikeToggle = async (e, auctionId) => {
    e.preventDefault();
    try {
      const response = await fetch(`/wp-json/custom/v1/wishlist/toggle/${auctionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce,
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle wishlist');
      }

      // Handle successful response
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const renderAuctionCard = (auction) => (
    <div key={auction.id} className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between">
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
          <img src="/heart_icon.svg" alt="heart icon" style={{ cursor: 'pointer' }} onClick={(e) => handleLikeToggle(e, auction.id)} />  
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

  if (loading) {
    return (
      <div className="auction-archive">
        <h3 className="text-2xl font-bold text-center text-black mb-12">{texts.auctionsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auction-archive">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="auction-archive">
      <h3 className="text-2xl font-bold text-center text-black mb-12">{texts.auctionsTitle}</h3>
      {auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map(auction => renderAuctionCard(auction))}
        </div>
      ) : (
        <p>{texts.noAuctionsFound}</p>
      )}
    </div>
  );
};

export default AuctionArchive;