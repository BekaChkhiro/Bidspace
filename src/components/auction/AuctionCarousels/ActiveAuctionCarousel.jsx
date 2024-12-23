import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const ActiveAuctionCarousel = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const texts = {
    auctionsTitle: "აქტიური აუქციონები",
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
    placeBid: "განათავსე ბიდი",
    buyNow: "ახლავე ყიდვა"
  };

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

  const renderAuctionCard = (auction) => {
    const now = new Date().getTime();
    const startTime = new Date(auction.meta.start_time).getTime();
    const endTime = new Date(auction.meta.due_time).getTime();
    
    let status = '';
    let statusColor = '';
    
    if (now < startTime) {
      status = 'მოლოდინში';
      statusColor = '#FFA500';
    } else if (now >= startTime && now < endTime) {
      status = 'აქტიური';
      statusColor = '#19B200';
    } else {
      status = 'დასრულებული';
      statusColor = '#FF0000';
    }

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
              style={{ backgroundColor: statusColor }}
            >
              {status}
            </div>
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
            <p className="text-lg font-bold mb-4">{texts.auctionWillEnd}</p>
            <AuctionTimer endDate={auction.meta.due_time} texts={texts} />
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

  useEffect(() => {
    const fetchActiveAuctions = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/auction?_embed&per_page=-1');
        if (!response.ok) throw new Error('Failed to fetch auctions');
        
        const data = await response.json();
        const now = Date.now();
        
        // ფილტრაცია აქტიური აუქციონებისთვის
        const active = data.filter(auction => {
          const startTime = new Date(auction.meta.start_time).getTime();
          const endTime = new Date(auction.meta.due_time).getTime();
          return startTime <= now && endTime > now;
        }).sort((a, b) => {
          // დალაგება დასრულების დროის მიხედვით
          return new Date(a.meta.due_time) - new Date(b.meta.due_time);
        });
        
        setActiveAuctions(active);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAuctions();
  }, []);

  if (loading) {
    return <div>იტვირთება...</div>;
  }

  if (activeAuctions.length === 0) {
    return <div className="text-center">ამჟამად აქტიური აუქციონები არ არის</div>;
  }

  return (
    <div className="active-auctions-carousel">
      <h3 className="text-2xl font-bold text-center text-black mb-12">{texts.auctionsTitle}</h3>
      
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {activeAuctions.map(auction => (
          <SwiperSlide key={auction.id}>
            {renderAuctionCard(auction)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ActiveAuctionCarousel;