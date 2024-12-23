import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCustomToast from '../../../components/toast/CustomToast';
import AuctionItem from '../../../pages/AuctionArchive/components/AuctionItem';

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
          'X-WP-Nonce': window.wpApiSettings?.nonce
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
        const response = await fetch('/wp-json/custom/v1/wishlist');
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
    const fetchTheatreCinemaAuctions = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/auction?_embed&per_page=3&categories=YOUR_CATEGORY_ID&orderby=date&order=desc');
        if (!response.ok) {
          throw new Error('Failed to fetch auctions');
        }
        const data = await response.json();
        setTheatreCinemaAuctions(data);
      } catch (error) {
        setError('აუქციონების ჩატვირთვისას მოხდა შეცდომა');
        toast('აუქციონების ჩატვირთვისას მოხდა შეცდომა');
      } finally {
        setLoading(false);
      }
    };

    fetchTheatreCinemaAuctions();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {theatreCinemaAuctions.map(auction => (
          <div key={auction.id}>
            <AuctionItem
              auction={auction}
              texts={texts}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              getFeaturedImageUrl={getFeaturedImageUrl}
              handleImageError={handleImageError}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheatreCinemaCarousel;