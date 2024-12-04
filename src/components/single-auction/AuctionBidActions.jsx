import React, { useState, useEffect } from 'react';

const AuctionBidActions = ({ 
  auction, 
  currentUserId, 
  onBidPlaced,
  onTimeExtended 
}) => {
  const [newBid, setNewBid] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentAuctionPrice, setCurrentAuctionPrice] = useState(
    Number(auction?.meta?.auction_price) || 0
  );

  const minBidPrice = Number(auction?.meta?.min_bid_price) || 0;
  const dueTime = auction?.meta?.due_time;
  
  const auctionAuthorId = Number(auction?.author) || 
                         Number(auction?.author_id) || 
                         Number(auction?.post_author) || 
                         0;

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!dueTime) return null;
      const now = new Date().getTime();
      const endTime = new Date(dueTime).getTime();
      const difference = endTime - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 500);

    return () => clearInterval(timer);
  }, [dueTime]);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await fetch(`/wp-json/bidspace/v1/auction/${auction.id}/current-price`);
        if (response.ok) {
          const data = await response.json();
          if (data.price && data.price !== currentAuctionPrice) {
            setCurrentAuctionPrice(Number(data.price));
          }
        }
      } catch (error) {
        console.error('Error fetching current price:', error);
      }
    };

    const pricePoller = setInterval(fetchCurrentPrice, 500);

    return () => clearInterval(pricePoller);
  }, [auction.id, currentAuctionPrice]);

  const validateBid = (bidAmount) => {
    const bid = Number(bidAmount);
    const minimumAllowedBid = currentAuctionPrice + minBidPrice;
    
    if (isNaN(bid)) {
      return 'გთხოვთ შეიყვანოთ ვალიდური რიცხვი';
    }
    if (bid < minimumAllowedBid) {
      return `ბიდი უნდა იყოს მინიმუმ ${minimumAllowedBid} ₾`;
    }
    return null;
  };

  const placeBid = async (bidAmount) => {
    if (!currentUserId) {
      setError('გთხოვთ გაიაროთ ავტორიზაცია');
      return;
    }

    if (currentUserId === auctionAuthorId) {
      setError('თქვენ არ შეგიძლიათ საკუთარ აუქციონზე ბიდის დადება');
      return;
    }

    const validationError = validateBid(bidAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/wp-json/bidspace/v1/auction/${auction.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings?.restNonce || ''
        },
        body: JSON.stringify({
          bid_price: Number(bidAmount),
          user_id: currentUserId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ბიდის განთავსება ვერ მოხერხდა');
      }

      const data = await response.json();
      
      if (data.was_extended) {
        onTimeExtended?.(data.due_time);
      }

      setNewBid('');
      setCurrentAuctionPrice(Number(data.current_price));
      
      if (typeof onBidPlaced === 'function') {
        onBidPlaced(data);
      }

      const event = new CustomEvent('auctionUpdated', { 
        detail: { 
          currentPrice: Number(data.current_price),
          wasExtended: data.was_extended,
          dueTime: data.due_time
        }
      });
      document.dispatchEvent(event);

    } catch (err) {
      setError(err.message || 'ბიდის განთავსება ვერ მოხერხდა');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBidSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    placeBid(newBid);
  };

  const handleQuickBid = () => {
    setError('');
    const quickBidAmount = currentAuctionPrice + minBidPrice;
    setNewBid(quickBidAmount.toString());
  };

  const userCanBid = Boolean(currentUserId) && currentUserId !== auctionAuthorId;
  const minimumBid = currentAuctionPrice + minBidPrice;

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleBidSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2 justify-between">
          <button
            type="button"
            onClick={handleQuickBid}
            className="w-[10%] bg-[#00adef] text-white rounded-full text-lg h-11 hover:bg-[#80d6f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            disabled={isSubmitting || !userCanBid}
            title="სწრაფი ბიდი"
          >
            +{minBidPrice}₾
          </button>
          <input
            type="number"
            value={newBid}
            onChange={(e) => setNewBid(e.target.value)}
            min={minimumBid}
            placeholder={`მინ. ${minimumBid} ₾`}
            className="w-[50%] p-4 border rounded-full text-center text-lg h-11"
            disabled={isSubmitting || !userCanBid}
          />
          <button
            type="submit"
            className="w-[40%] bg-[#00AEEF] text-white rounded-full text-lg h-11 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newBid || Number(newBid) < minimumBid || isSubmitting || !userCanBid}
          >
            {isSubmitting ? 'იტვირთება...' : 'განათავსე ბიდი'}
          </button>
        </div>
        
        {timeLeft !== null && timeLeft <= 30 && (
          <p className="text-orange-500 text-sm text-center">
            დარჩენილია {timeLeft} წამი! ბიდის დადების შემთხვევაში დრო გაგრძელდება 30 წამით
          </p>
        )}
        
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        {!currentUserId && (
          <p className="text-gray-500 text-sm text-center">
            ბიდის დასადებად გთხოვთ გაიაროთ ავტორიზაცია
          </p>
        )}
        {currentUserId && currentUserId === auctionAuthorId && (
          <p className="text-gray-500 text-sm text-center">
            თქვენ არ შეგიძლიათ საკუთარ აუქციონზე ბიდის დადება
          </p>
        )}
      </form>
    </div>
  );
};

export default AuctionBidActions;