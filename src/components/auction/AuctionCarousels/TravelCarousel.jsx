import React, { useEffect, useState } from 'react';
import { useWishlist } from '../../../components/core/context/WishlistContext';
import useCustomToast from '../../../components/toast/CustomToast';
import AuctionItem from '../../../pages/AuctionArchive/components/AuctionItem';
import { Carousel, CarouselContent, CarouselItem } from '../../../components/ui/carousel';
import SkeletonLoader from './SkeletonLoader';

const TravelCarousel = () => {
  const [travelAuctions, setTravelAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wishlist, toggleWishlistItem } = useWishlist();
  const toast = useCustomToast();

  const texts = {
    auctionsTitle: "მოგზაურობა",
    loading: "იტვირთება...",
    imageLoading: "გამოსახულება იტვირთება...",
    ticketPrice: "ბილეთის ფასი",
    currentPrice: "მიმდინარე ფასი", 
    currency: "₾",
    timeLeft: "დარჩენილი დრო",
    days: "დღე",
    hours: "საათი",
    minutes: "წუთი",
    seconds: "წამი",
    buyNow: "ახლავე ყიდვა"
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

  const handleWishlistToggle = async (e, auctionId) => {
    e.preventDefault();
    await toggleWishlistItem(auctionId);
  };

  useEffect(() => {
    const fetchTravelAuctions = async (retryCount = 0) => {
      try {
        const response = await fetch('/wp-json/wp/v2/auction?per_page=100&_embed', {
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

        const data = await response.json();
        const travelAuctions = data.filter(auction => 
          auction.meta?.auction_category === 'travel'
        );
        setTravelAuctions(travelAuctions);
      } catch (error) {
        console.error('Error fetching travel auctions:', error);
        setError('მოგზაურობის აუქციონების ჩატვირთვისას მოხდა შეცდომა');
        
        if (retryCount < 3) {
          setTimeout(() => {
            fetchTravelAuctions(retryCount + 1);
          }, 2000 * Math.pow(2, retryCount));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTravelAuctions();
  }, []);

  if (loading) {
    return (
      <div className="travel-auctions-carousel">
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
    return <div className="text-red-500">{error}</div>;
  }

  if (travelAuctions.length === 0) {
    return <div className="text-center">ამჟამად აქტიური აუქციონები არ არის</div>;
  }

  return (
    <div className="travel-auctions-carousel">
      <h3 className="text-2xl font-bold text-center text-black mb-12">{texts.auctionsTitle}</h3>
      <Carousel 
        className="w-full" 
        opts={{
          dragFree: true,
          containScroll: "trimSnaps",
          slidesToScroll: 1,
          align: "start",
          breakpoints: {
            '(min-width: 1024px)': { slidesToShow: 3.5 },
            '(min-width: 768px)': { slidesToShow: 2.5 },
            '(max-width: 767px)': { slidesToShow: 1.5 }
          }
        }}
      >
        <CarouselContent>
          {travelAuctions.map(auction => (
            <CarouselItem key={auction.id} className="basis-[85%] md:basis-[45%] lg:basis-[30%]">
              <AuctionItem
                auction={auction}
                texts={texts}
                wishlist={wishlist}
                onWishlistToggle={handleWishlistToggle}
                getFeaturedImageUrl={getFeaturedImageUrl}
                handleImageError={handleImageError}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default TravelCarousel;