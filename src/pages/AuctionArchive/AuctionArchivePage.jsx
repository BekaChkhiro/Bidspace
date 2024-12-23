import React, { useState, useEffect } from 'react';
import AuctionArchiveFilterContainer from './Filters/AuctionArchiveFilterContainer';
import AuctionCategoryItems from '../../components/auction/AuctionCategoryItems';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import { useToast } from "../../components/ui/use-toast";
import AuctionItem from './components/AuctionItem';
import { SkeletonLoader } from './components/SkeletonLoader';

const AuctionArchivePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
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

  useEffect(() => {
    if (user?.id) {
      fetchUserWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchUserWishlist = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/users/me`, {
        headers: {
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched wishlist:', userData.wishlist);
        setWishlist(userData.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleWishlistToggle = async (e, auctionId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        description: "გთხოვთ გაიაროთ ავტორიზაცია",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/wp-json/custom/v1/wishlist/toggle/${auctionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const isAdding = !wishlist.includes(auctionId);
        const newWishlist = isAdding 
          ? [...wishlist, auctionId]
          : wishlist.filter(id => id !== auctionId);
        
        setWishlist(newWishlist);
        
        toast({
          description: isAdding ? 
            'აუქციონი დაემატა სურვილების სიაში' : 
            'აუქციონი წაიშალა სურვილების სიიდან'
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        description: "დაფიქსირდა შეცდომა",
        variant: "destructive",
      });
    }
  };

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
        if (user?.id) {
          fetchUserWishlist();
        }
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

  const handleImageError = (event) => {
    event.target.src = '/placeholder.jpg';
  };

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
      <div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10">
        <div className="auction-archive">
          <AuctionCategoryItems />
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
        <AuctionArchiveFilterContainer 
          onDateFilterChange={handleDateFilterChange}
          onMainFilterChange={handleMainFilterChange}
        />
        {auctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {auctions.map(auction => (
                <AuctionItem
                  key={auction.id}
                  auction={auction}
                  texts={texts}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                  getFeaturedImageUrl={getFeaturedImageUrl}
                  handleImageError={handleImageError}
                />
              ))}
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