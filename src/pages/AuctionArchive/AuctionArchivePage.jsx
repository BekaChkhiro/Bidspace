import React, { useState, useEffect } from 'react';
import AuctionCategoryItems from '../../components/auction/AuctionCategoryItems';
import AuctionDateFilter from './Filters/AuctionDateFilter';
import { useAuth } from '../../components/core/context/AuthContext';
import useCustomToast from '../../components/toast/CustomToast';
import AuctionItem from './components/AuctionItem';
import { SkeletonLoader } from './components/SkeletonLoader';
import FilterPopup from './components/FilterPopup'; // Import the new FilterPopup component
import ActiveFilters from './components/ActiveFilters';

const AuctionArchivePage = () => {
  const { user } = useAuth();
  const toast = useCustomToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [mainFilters, setMainFilters] = useState({
    categories: [],
    city: '',
    auctionPrice: {
      min: '',
      max: ''
    },
    instantPrice: {
      min: '',
      max: ''
    }
  });
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false); // State to manage popup visibility
  const auctionsPerPage = 9;

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
        
        toast(isAdding ? 
          'აუქციონი დაემატა სურვილების სიაში' : 
          'აუქციონი წაიშალა სურვილების სიიდან'
        );
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        description: "დაფიქსირდა შეცდომა",
        variant: "destructive",
      });
    }
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
    fetchAuctions(1, filter);
  };

  const handleMainFilterChange = (filters) => {
    setMainFilters(filters);
    setCurrentPage(1);
    fetchAuctions(1, dateFilter, filters);
  };

  const handleFilterButtonClick = () => {
    setIsFilterPopupOpen(!isFilterPopupOpen);
  };

  const handleFilterPopupClose = () => {
    setIsFilterPopupOpen(false);
  };

  const handleFilterApply = (filters) => {
    setMainFilters(filters);
    setCurrentPage(1);
    fetchAuctions(1, dateFilter, filters);
    setIsFilterPopupOpen(false);
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...mainFilters };
    if (filterKey === 'city') {
      newFilters.city = '';
    } else {
      newFilters[filterKey] = { min: '', max: '' };
    }
    setMainFilters(newFilters);
    fetchAuctions(1, dateFilter, newFilters);
  };

  const handleRemoveDateFilter = () => {
    setDateFilter(null);
    fetchAuctions(1, null, mainFilters);
  };

  const fetchAuctions = async (page, dateFilterValue = dateFilter, mainFiltersValue = mainFilters) => {
    try {
      const isInitialLoad = page === 1;
      isInitialLoad ? setLoading(true) : setLoadingMore(true);
  
      let url = `/wp-json/wp/v2/auction?_embed&per_page=${auctionsPerPage}&page=${page}`;
      
      // Add date filter parameters
      if (dateFilterValue) {
        url += `&after=${dateFilterValue.from}&before=${dateFilterValue.to}`;
      }

      // Add main filter parameters
      if (mainFiltersValue) {
        if (mainFiltersValue.categories.length > 0) {
          url += `&categories=${mainFiltersValue.categories.join(',')}`;
        }
        if (mainFiltersValue.city) {
          url += `&city=${mainFiltersValue.city}`;
        }
        if (mainFiltersValue.auctionPrice.min) {
          url += `&min_price=${mainFiltersValue.auctionPrice.min}`;
        }
        if (mainFiltersValue.auctionPrice.max) {
          url += `&max_price=${mainFiltersValue.auctionPrice.max}`;
        }
        if (mainFiltersValue.instantPrice.min) {
          url += `&min_instant_price=${mainFiltersValue.instantPrice.min}`;
        }
        if (mainFiltersValue.instantPrice.max) {
          url += `&max_instant_price=${mainFiltersValue.instantPrice.max}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
  
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      const data = await response.json();
      
      if (isInitialLoad) {
        setAuctions(data);
        if (user?.id) {
          fetchUserWishlist();
        }
      } else {
        setAuctions(prev => [...prev, ...data]);
      }
      
      setHasMore(page < parseInt(totalPagesHeader || '1'));
      setError(null);

    } catch (err) {
      console.error('Fetch error:', err);
      setError('აუქციონების ჩატვირთვისას მოხდა შეცდომა');
      toast('აუქციონების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAuctions(1);
  }, []);

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

  if (loading) {
    return (
      <div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10">
        <div className="auction-archive flex flex-col gap-12">
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
    <div className="w-full bg-[#E6E6E6] px-4 md:px-8 lg:px-16 py-6 md:py-10 flex flex-col gap-6 md:gap-10">
      <div className="auction-archive flex flex-col gap-6 md:gap-8">
        <div className="flex justify-between items-center relative">
          <AuctionCategoryItems />
        </div>
        
        {/* Filters Section */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-row md:flex-row gap-4 md:items-center relative'>
            <div className="w-3/5 md:w-auto">
              <AuctionDateFilter 
                onDateFilterChange={handleDateFilterChange}
                currentDateFilter={dateFilter}
              />
            </div>
            <div className="w-2/5 md:w-auto md:ml-auto">
              <button
                onClick={handleFilterButtonClick}
                className="w-full md:w-auto min-w-[120px] px-6 py-2.5 text-xs md:text-sm rounded-full border border-[#D9D9D9] 
                  bg-white text-gray-700 hover:bg-gray-50"
              >
                ფილტრი
              </button>
            </div>
            {isFilterPopupOpen && (
              <FilterPopup
                onClose={handleFilterPopupClose}
                onApply={handleFilterApply}
                currentFilters={mainFilters}
              />
            )}
          </div>
          
          {/* Active Filters */}
          {(dateFilter || Object.values(mainFilters).some(v => v && v.length !== 0 || (typeof v === 'object' && v.min))) && (
            <ActiveFilters
              filters={mainFilters}
              dateFilter={dateFilter}
              onRemoveFilter={handleRemoveFilter}
              onRemoveDateFilter={handleRemoveDateFilter}
            />
          )}
        </div>

        {/* Auctions Grid */}
        {auctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            {/* ...existing load more button... */}
          </>
        ) : (
          <p className="text-center py-8">{texts.noAuctionsFound}</p>
        )}
      </div>
    </div>
  );
};

export default AuctionArchivePage;