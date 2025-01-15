import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AuctionImage from '../components/auction/single-auction/AuctionImage';
import AuctionHeaderInfo from '../components/auction/single-auction/AuctionHeaderInfo';
import AuctionPriceContainer from '../components/auction/single-auction/AuctionPriceContainer';
import AuctionTimerStatus from '../components/auction/single-auction/AuctionTimerStatus';
import AuctionBidsList from '../components/auction/single-auction/AuctionBidsList';
import AuctionComments from '../components/auction/single-auction/AuctionComments';
import { useAuction } from '../components/core/context/AuctionContext';
import { useAuctionPolling } from '../hooks/useAuctionPolling';
import { useWebSocket } from '../hooks/useWebSocket';
import RelatedAuctions from '../components/auction/single-auction/RelatedAuctions';

function SingleAuction() {
  const { id } = useParams();
  const { auctions, bidsList, updateAuction } = useAuction();
  const { sendBid } = useWebSocket(id);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(() => {
    const userId = window.bidspaceSettings?.userId;
    return userId ? Number(userId) : null;
  });

  const [currentUserName, setCurrentUserName] = useState(() => {
    return window.bidspaceSettings?.userName || '';
  });

  // დავიწყოთ polling
  useAuctionPolling(id);

  const auction = auctions[id];
  const currentBids = bidsList[id] || [];

  // დებაგინგისთვის გავაფართოვოთ logging
  useEffect(() => {
    console.log('Current user ID:', currentUserId);
    console.log('Current user name:', currentUserName);
    console.log('Nonce:', window.bidspaceSettings?.nonce);
    console.log('Full auction data:', auction);
    console.log('Auction ID:', id); // დავამატოთ აუქციონის ID-ის ლოგი
    
    // შევამოწმოთ API endpoint-ის მისაწვდომობა
    fetch(`${window.location.origin}/wp-json/wp/v2/auction/${id}`)
      .then(response => {
        console.log('API Response:', response);
        return response.json();
      })
      .then(data => console.log('Auction API Data:', data))
      .catch(error => console.error('API Error:', error));
  }, [currentUserId, currentUserName, auction, id]);

  // აუქციონის მონაცემების შემოწმება
  useEffect(() => {
    if (auction) {
      setIsLoading(false);
    }
  }, [auction]);

  // User ID-ის შემოწმება
  useEffect(() => {
    const checkUserId = () => {
      const userId = window.bidspaceSettings?.userId;
      if (userId) {
        setCurrentUserId(Number(userId));
      }
    };

    checkUserId();
    const interval = setInterval(checkUserId, 2000);
    return () => clearInterval(interval);
  }, []);

  // გვერდის სათაურის დაყენება
  useEffect(() => {
    if (auction?.title?.rendered) {
      const cleanTitle = auction.title.rendered.replace(/<[^>]*>/g, '');
      document.title = `${cleanTitle}`;
    } else {
      document.title = 'აუქციონის დეტალები | აუქციონი';
    }

    return () => {
      document.title = 'აუქციონი';
    };
  }, [auction?.title?.rendered]);

  const handleCommentSubmit = async (commentText) => {
    if (!window.bidspaceSettings?.userId) {
      throw new Error('გთხოვთ გაიაროთ ავტორიზაცია');
    }
  
    if (!window.bidspaceSettings?.restNonce) {
      throw new Error('Authentication token is missing');
    }
  
    try {
      const response = await fetch(`${window.location.origin}/wp-json/wp/v2/auction/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings.restNonce
        },
        credentials: 'include',
        body: JSON.stringify({
          comment_area: commentText.trim()
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
  
      const responseData = await response.json();
      
      // Update auction object with new comments
      const updatedAuction = {
        ...auction,
        meta: {
          ...auction.meta,
          comments: responseData.allComments
        }
      };
      
      updateAuction(updatedAuction);
      return responseData;
  
    } catch (error) {
      console.error('Comment submission error:', error);
      throw error;
    }
  };

  const handleBidSubmit = async (bidAmount) => {
    try {
      // Send bid to server via REST API
      const response = await fetch(`${window.location.origin}/wp-json/wp/v2/auction/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings.restNonce
        },
        body: JSON.stringify({ bid_amount: bidAmount })
      });

      if (!response.ok) {
        throw new Error('Failed to submit bid');
      }

      const bidData = await response.json();
      
      // Send bid update via WebSocket
      sendBid({
        bid_amount: bidAmount,
        user_id: currentUserId,
        user_name: currentUserName,
        timestamp: new Date().toISOString()
      });

      // Update local state
      updateAuction({
        ...auction,
        current_bid: bidAmount
      });

    } catch (error) {
      console.error('Bid submission error:', error);
      throw error;
    }
  };

  // Loading ინდიკატორი
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#E6E6E6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00AEEF] mx-auto"></div>
          <p className="mt-4 text-gray-600">იტვირთება...</p>
        </div>
      </div>
    );
  }

  // შეცდომის შემთხვევაში
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#E6E6E6]">
        <div className="text-center text-red-500">
          <p>დაფიქსირდა შეცდომა: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
          >
            სცადეთ თავიდან
          </button>
        </div>
      </div>
    );
  }

  // თუ აუქციონი არ არსებობს
  if (!auction) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#E6E6E6]">
        <div className="text-center text-gray-600">
          <p>აუქციონი ვერ მოიძებნა</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
          >
            მთავარ გვერდზე დაბრუნება
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-[#E6E6E6] px-4 sm:px-8 lg:px-16 py-5 sm:py-8 lg:py-10 flex flex-col gap-5 sm:gap-8 lg:gap-10'>
      <div className='w-full bg-white p-3 sm:p-4 lg:p-5 rounded-2xl flex flex-col lg:flex-row gap-4 lg:gap-5'>
        <div className='w-full lg:w-1/2 flex flex-col gap-4'>
          <AuctionImage mediaId={auction.featured_media} />
          {/* Bids history is now visible only on desktop */}
          <div className="hidden lg:block bg-white rounded-lg p-3 sm:p-4 shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">ბიდების ისტორია</h3>
            <AuctionBidsList bids={currentBids} />
          </div>
        </div>
        <div className='w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4'>
          <h1 className="text-xl sm:text-2xl font-bold">
            {auction.title?.rendered || 'უსათაურო აუქციონი'}
          </h1>

          <AuctionHeaderInfo 
            authorName={auction.author_data?.display_name}
            city={auction.meta?.city}
            startTime={auction.meta?.start_time}
          />
          
          <AuctionPriceContainer auction={auction} />
          
          <AuctionTimerStatus 
            auction={{
              ...auction,
              buy_now_price: auction.meta?.buy_now_price
            }}
            startTime={auction.meta?.start_time}
            dueTime={auction.meta?.due_time}
            currentUserId={currentUserId}
            onBidPlaced={handleBidSubmit}
          />
        </div>
      </div>

      {/* Bids history for mobile devices */}
      <div className="lg:hidden w-full bg-white rounded-2xl p-3 sm:p-4 shadow">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">ბიდების ისტორია</h3>
        <AuctionBidsList bids={currentBids} />
      </div>

      <AuctionComments
        comments={auction.meta?.comments || {}}
        currentUserName={currentUserName}
        onSubmitComment={handleCommentSubmit}
      />

      <RelatedAuctions currentAuctionId={id} />
    </div>
  );
}

export default SingleAuction;