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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

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

const RelatedAuctions = ({ currentAuctionId = '' }) => {
  const [relatedAuctions, setRelatedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const texts = {
    relatedAuctionsTitle: "მსგავსი აუქციონები",
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
    noRelatedAuctions: "მსგავსი აუქციონები ვერ მოიძებნა",
    placeBid: "განათავსე ბიდი",
    buyNow: "ახლავე ყიდვა"
  };

  useEffect(() => {
    const fetchRelatedAuctions = async () => {
      try {
        // მხოლოდ მიმდინარე აუქციონის გამორიცხვა
        const endpoint = `/wp-json/wp/v2/auction?_embed&per_page=3&exclude=${currentAuctionId}&orderby=date&order=desc`;
        console.log('Fetching from:', endpoint);

        const response = await fetch(endpoint);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch related auctions');
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        setRelatedAuctions(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching related auctions:', err);
        setError('მსგავსი აუქციონების ჩატვირთვისას მოხდა შეცდომა');
        setLoading(false);
      }
    };

    if (currentAuctionId) {
      fetchRelatedAuctions();
    }
  }, [currentAuctionId]);

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

  const renderAuctionCard = (auction) => (
    <div key={auction.id} className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between">
      <Link to={getAuctionLink(auction.id)} className="flex flex-col gap-3 sm:gap-4">
        <div className="relative" style={{ height: '150px sm:height-[180px]' }}>
          <img
            src={getFeaturedImageUrl(auction)}
            alt={auction.title.rendered}  
            className="w-full h-full object-cover rounded-xl"
            onError={handleImageError}
          />
          <div 
            className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs sm:text-sm" 
            style={getBadgeStyle(auction)}
          >
            {getAuctionStatus(auction)}
          </div>
        </div>
        <div className="flex justify-between gap-3 sm:gap-6 items-center">
          <h4 className="text-base sm:text-lg font-bold line-clamp-2" dangerouslySetInnerHTML={{ __html: auction.title.rendered }}></h4>
          <img src="/heart_icon.svg" alt="heart icon" className="w-5 h-5 sm:w-6 sm:h-6" style={{ cursor: 'pointer' }} />  
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6">
          <div className="w-full sm:w-1/2 flex flex-col items-start">
            <h5 className="text-sm sm:text-lg font-normal">{texts.ticketPrice}</h5>
            <span className="text-sm sm:text-lg font-normal">{auction.meta.ticket_price} {texts.currency}</span>
          </div>
          <div className="w-full sm:w-1/2 flex flex-col items-start">  
            <h5 className="text-sm sm:text-lg font-normal">{texts.currentPrice}</h5>
            <span className="text-sm sm:text-lg font-normal" style={{color: '#00AEEF'}}>
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

        <div className="flex flex-col gap-2 sm:gap-3 mt-3 sm:mt-4">
          <Link 
            to={getAuctionLink(auction.id)} 
            className="w-full p-2 sm:p-3 text-white text-center text-sm sm:text-base rounded-full" 
            style={{ backgroundColor: '#00AEEF' }}
          >
            {texts.placeBid}
          </Link>
          <Link
            to={getAuctionLink(auction.id)}  
            className="w-full p-2 sm:p-3 text-center text-sm sm:text-base rounded-full"
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
      <div className="w-full bg-[#E6E6E6] p-3 sm:p-5 rounded-2xl">
        <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">{texts.relatedAuctionsTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(3)].map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#E6E6E6] p-5 rounded-2xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!relatedAuctions.length) {
    return (
      <div className="w-full bg-[#E6E6E6] p-5 rounded-2xl">
        <p className="text-gray-600">{texts.noRelatedAuctions}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#E6E6E6] p-3 sm:p-5 rounded-2xl">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">{texts.relatedAuctionsTitle}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {relatedAuctions.map(auction => renderAuctionCard(auction))}
      </div>
    </div>
  );
};

export default RelatedAuctions;