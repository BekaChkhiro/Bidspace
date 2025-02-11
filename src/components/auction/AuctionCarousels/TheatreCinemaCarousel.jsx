import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCustomToast from '../../../components/toast/CustomToast';
import AuctionItem from '../../../pages/AuctionArchive/components/AuctionItem';
import { Carousel, CarouselContent, CarouselItem } from '../../../components/ui/carousel';
import SkeletonLoader from './SkeletonLoader';

const TheatreCinemaCarousel = () => {
  const [theatreCinemaAuctions, setTheatreCinemaAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const toast = useCustomToast();

  const texts = {
    auctionsTitle: "თეატრი და კინო",
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

  const handleImageError = (event) => {
    event.target.src = '/placeholder.jpg';
  };

  const handleWishlistToggle = async (e, auctionId) => {
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

      if (response.ok) {
        setWishlist(prev => {
          const isInWishlist = prev.includes(Number(auctionId));
          if (isInWishlist) {
            toast("აუქციონი წაიშალა სურვილების სიიდან");
            return prev.filter(id => id !== Number(auctionId));
          } else {
            toast("აუქციონი დაემატა სურვილების სიაში");
            return [...prev, Number(auctionId)];
          }
        });
      } else {
        throw new Error('Failed to toggle wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast("შეცდომა სურვილების სიის განახლებისას");
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/wp-json/custom/v1/wishlist', {
          headers: {
            'X-API-Key': window.wpApiSettings?.apiKey || ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          setWishlist(data.map(Number));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchTheatreCinemaAuctions = async (retryCount = 0) => {
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
        
        // ფილტრაცია ticket_category-ის და visibility-ის მიხედვით
        const theatreCinemaAuctions = data.filter(auction => 
          auction.meta.ticket_category === "თეატრი-კინო" && 
          auction.meta.visibility === true
        );

        if (theatreCinemaAuctions.length === 0) {
          setError('ამ კატეგორიაში აუქციონები ვერ მოიძებნა');
          return;
        }

        setTheatreCinemaAuctions(theatreCinemaAuctions);
        setError(null);

      } catch (error) {
        console.error('Error fetching auctions:', error);
        
        if (retryCount < 2) {
          setTimeout(() => {
            fetchTheatreCinemaAuctions(retryCount + 1);
          }, 2000);
        } else {
          setError('აუქციონების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.');
          toast('აუქციონების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTheatreCinemaAuctions();
  }, [toast]);

  if (loading) {
    return (
      <div className="theatre-cinema-auctions-carousel">
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

  if (theatreCinemaAuctions.length === 0) {
    return <div className="text-center">ამჟამად აქტიური აუქციონები არ არის</div>;
  }

  return (
    <div className="theatre-cinema-auctions-carousel">
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
          {theatreCinemaAuctions.map(auction => (
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

export default TheatreCinemaCarousel;