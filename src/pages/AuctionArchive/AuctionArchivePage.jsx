import { useAuctions } from '../../hooks/useAuctions'

const AuctionArchivePage = () => {
  const { user } = useAuth();
  const toast = useCustomToast();
  const [filters, setFilters] = useState({});
  const [wishlist, setWishlist] = useState([]);

  const { 
    data: auctions = [], 
    isLoading, 
    error 
  } = useAuctions(filters);

  const texts = {
    pageTitle: "აუქციონები",
    auctionsTitle: "აუქციონები",
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
    setFilters(prev => ({
      ...prev,
      dateFilter: filter
    }));
  };

  const handleMainFilterChange = (filters) => {
    setFilters(curr => ({
      ...curr,
      mainFilter: filters
    }));
  };

  const handleRemoveFilter = (filterKey) => {
    setFilters(curr => ({
      ...curr,
      mainFilter: {
        ...curr.mainFilter,
        [filterKey]: undefined
      }
    }));
  };

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full bg-[#E6E6E6] px-4 md:px-8 lg:px-16 py-6 md:py-10 flex flex-col gap-6 md:gap-10">
      <div className="auction-archive flex flex-col gap-6 md:gap-8">
        <div className="flex justify-between items-center relative">
          <AuctionCategoryItems />
        </div>
        
        <AuctionFilters
          filters={filters}
          onDateFilterChange={handleDateFilterChange}
          onFilterApply={handleMainFilterChange}
          onRemoveFilter={handleRemoveFilter}
        />

        {/* Auctions Grid including pagination and load more */}       
        {auctions.length > 0 ? (
          <AuctionsGrid auctions={auctions} onLoadMore={handleLoadMore} />
        ) : (
          <NoAuctionsFound message={texts.noAuctionsFound} />
        )}
      </div>
    </div>
  );
};

export default AuctionArchivePage;