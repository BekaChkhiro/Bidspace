import React, { useState, useEffect } from 'react';
import AuctionItem from '../components/AuctionItem';
import { SkeletonLoader } from '../components/SkeletonLoader';
import AuctionCategoryItems from '../../../components/auction/AuctionCategoryItems';
import { useAuth } from '../../../components/core/context/AuthContext';
import useCustomToast from '../../../components/toast/CustomToast';
import AuctionDateFilter from '../Filters/AuctionDateFilter';

const AuctionTravelPage = () => {
  const { user } = useAuth();
  const toast = useCustomToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [dateFilter, setDateFilter] = useState(() => {
    const savedFilter = localStorage.getItem('auctionDateFilter');
    return savedFilter ? JSON.parse(savedFilter) : null;
  });

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    fetchAuctions(filter);
  };

  const fetchAuctions = async (dateFilterValue = dateFilter) => {
    try {
      setLoading(true);
      let url = `/wp-json/wp/v2/auction?per_page=100&_embed`;
      
      if (dateFilterValue) {
        url += `&after=${dateFilterValue.from}&before=${dateFilterValue.to}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`მონაცემების ჩატვირთვა ვერ მოხერხდა (სტატუსი: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('Fetched data with media:', data);
      
      const sportAuctions = data.filter(auction => 
        auction.meta.ticket_category === "მოგზაურობა"
      );
      console.log('Filtered sport auctions:', sportAuctions);
      
      setAuctions(sportAuctions);
      setHasMore(false);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
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

  const texts = {
    pageTitle: "მოგზაურობა",
    auctionsTitle: "მოგზაურობა",
    loading: "იტვირთება...",
    loadMore: "მეტის ნახვა",
    imageLoading: "გამოახულება იტვირთება...",
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
      document.title = 'მოგზაურობა';
    };
  }, []);

  const getFeaturedImageUrl = (auction) => {
    try {
      if (auction._embedded && 
          auction._embedded['wp:featuredmedia'] && 
          auction._embedded['wp:featuredmedia'][0]) {
        return auction._embedded['wp:featuredmedia'][0].source_url;
      }
      console.log('No featured image found for auction:', auction.id);
      return '/placeholder.jpg';
    } catch (error) {
      console.error('Error getting featured image:', error);
      return '/placeholder.jpg';
    }
  };

  const handleImageError = (event) => {
    console.log('Image failed to load, using placeholder');
    event.target.src = '/placeholder.jpg';
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

  if (loading) {
    return (
      <div className="w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10">
        <div className="auction-archive flex flex-col gap-12">
          <AuctionCategoryItems />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
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
        <div className="flex justify-between items-center">
          <AuctionCategoryItems />
        </div>
        <AuctionDateFilter 
          onDateFilterChange={handleDateFilterChange}
        />
        {auctions.length > 0 ? (
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
        ) : (
          <p>{texts.noAuctionsFound}</p>
        )}
      </div>
    </div>
  );
};

export default AuctionTravelPage;