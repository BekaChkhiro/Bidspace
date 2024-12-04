import React, { useState, useEffect } from 'react';
import AuctionArchiveFilterContainer from './Filters/AuctionArchiveFilterContainer';
import AuctionCategoryItems from '../../components/AuctionCategoryItems';
import { Link } from 'react-router-dom';

const SkeletonLoader = () => (
  <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between animate-pulse">
    <div className="relative h-[180px] bg-gray-200 rounded-xl">
      <div className="absolute top-2 left-2 w-16 h-6 bg-gray-300 rounded-full"/>
    </div>
    
    <div className="flex justify-between gap-6 items-center mt-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"/>
      <div className="h-6 w-6 bg-gray-200 rounded-full"/>
    </div>
    
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

const AuctionArchivePage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const auctionsPerPage = 9;
  const [dateFilter, setDateFilter] = useState(() => {
    const savedFilter = localStorage.getItem('auctionDateFilter');
    if (savedFilter) {
      const parsed = JSON.parse(savedFilter);
      return {
        from: new Date(parsed.from),
        to: new Date(parsed.to)
      };
    }
    return null;
  });
  const [mainFilters, setMainFilters] = useState(null);

  const texts = {
    pageTitle: "აუქციონები",
    auctionsTitle: "აუქციონები",
    loading: "იტვირთება...",
    loadMore: "მეტის ნახვა",
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
    document.title = texts.pageTitle;
    return () => {
      document.title = 'აუქციონი';
    };
  }, []);

  useEffect(() => {
    if (dateFilter) {
      localStorage.setItem('auctionDateFilter', JSON.stringify(dateFilter));
    } else {
      localStorage.removeItem('auctionDateFilter');
    }
  }, [dateFilter]);

  const fetchAuctions = async (page) => {
    try {
      const isInitialLoad = page === 1;
      isInitialLoad ? setLoading(true) : setLoadingMore(true);
  
      let url = `/wp-json/wp/v2/auction?_embed&per_page=${auctionsPerPage}&page=${page}`;
      
      if (mainFilters?.city) {
        url += `&city=${encodeURIComponent(mainFilters.city)}`;
      }

      if (mainFilters?.auctionPrice?.min) {
        url += `&min_price=${mainFilters.auctionPrice.min}`;
      }
      if (mainFilters?.auctionPrice?.max) {
        url += `&max_price=${mainFilters.auctionPrice.max}`;
      }

      if (mainFilters?.instantPrice?.min) {
        url += `&min_buy_now=${mainFilters.instantPrice.min}`;
      }
      if (mainFilters?.instantPrice?.max) {
        url += `&max_buy_now=${mainFilters.instantPrice.max}`;
      }

      if (dateFilter?.from) {
        url += `&start_date=${dateFilter.from.toISOString().split('T')[0]}`;
      }
      if (dateFilter?.to) {
        url += `&end_date=${dateFilter.to.toISOString().split('T')[0]}`;
      }
  
      console.log('Fetching URL:', url);
  
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
  
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      const data = await response.json();
      
      console.log('Response data:', data);
      
      if (isInitialLoad) {
        setAuctions(data);
      } else {
        setAuctions(prev => [...prev, ...data]);
      }
      
      setHasMore(page < parseInt(totalPagesHeader || '1'));
    } catch (err) {
      console.error('Fetch error:', err);
      setError('აუქციონების ჩატვირთვისას მოხდა შეცდომა');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAuctions(1);
  }, []);

  useEffect(() => {
    if (dateFilter || mainFilters) {
      setCurrentPage(1);
      setAuctions([]);
      fetchAuctions(1);
    }
  }, [dateFilter, mainFilters]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAuctions(nextPage);
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
          <img src="/heart_icon.svg" alt="heart icon" style={{ cursor: 'pointer' }} />  
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

  const handleDateFilterChange = (dateRange) => {
    setDateFilter(dateRange);
  };

  const handleMainFilterChange = (filters) => {
    console.log('Received filters:', filters);
    setMainFilters(filters);
    setCurrentPage(1);
    setAuctions([]);
    fetchAuctions(1);
  };

  useEffect(() => {
    console.log('Current mainFilters:', mainFilters);
    console.log('Current dateFilter:', dateFilter);
  }, [mainFilters, dateFilter]);

  if (loading) {
    return (
      <div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10"><div className="auction-archive">
      <h3 className="text-2xl font-bold text-center text-black my-12">{texts.auctionsTitle}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(auctionsPerPage)].map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    </div>
  </div>
);
}

if (error) {
return (
  <div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10">
    <div className="auction-archive">
      <p className="text-red-500">{error}</p>
    </div>
  </div>
);
}

return (
<div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10">
  <div className="auction-archive flex flex-col gap-12">
  <AuctionCategoryItems />
    <h3 className="text-2xl font-bold text-center text-black">{texts.auctionsTitle}</h3>
    <AuctionArchiveFilterContainer 
      onDateFilterChange={handleDateFilterChange}
      onMainFilterChange={handleMainFilterChange}
    />
    {auctions.length > 0 ? (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map(renderAuctionCard)}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-12 py-2.5 rounded-full border border-[#D9D9D9] bg-white text-black hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed min-w-[200px]"
            >
              {loadingMore ? texts.loading : texts.loadMore}
            </button>
          </div>
        )}
      </>
    ) : (
      <p>{texts.noAuctionsFound}</p>
    )}
  </div>
</div>
);
};

export default AuctionArchivePage;