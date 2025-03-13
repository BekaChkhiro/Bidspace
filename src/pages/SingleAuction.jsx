import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AuctionImage from '../components/auction/single-auction/AuctionImage';
import AuctionHeaderInfo from '../components/auction/single-auction/AuctionHeaderInfo';
import AuctionPriceContainer from '../components/auction/single-auction/AuctionPriceContainer';
import AuctionTimerStatus from '../components/auction/single-auction/AuctionTimerStatus';
import AuctionBidsList from '../components/auction/single-auction/AuctionBidsList';
import AuctionComments from '../components/auction/single-auction/AuctionComments';
import AuctionDescription from '../components/auction/single-auction/AuctionDescription';
import { useAuction } from '../components/core/context/AuctionContext';
import { useAuctionPolling } from '../hooks/useAuctionPolling';
import RelatedAuctions from '../components/auction/single-auction/RelatedAuctions';

function SingleAuction() {
  const { id } = useParams();
  const { auctions, bidsList, updateAuction } = useAuction();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // Changed default tab to description
  
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

  // debagging-lfs gavafartuot logging
  useEffect(() => {
    console.log('Current user ID:', currentUserId);
    console.log('Current user name:', currentUserName);
    console.log('Nonce:', window.bidspaceSettings?.nonce);
    console.log('API Key:', window.wpApiSettings?.apiKey);
    console.log('Full auction data:', auction);
    console.log('Auction ID:', id); // დავამატოთ აუქციონის ID-ის ლოგი
    
    // შევამოწმოთ API endpoint-ის მისაწვდომობა
    fetch(`${window.location.origin}/wp-json/wp/v2/auction/${id}`, {
      headers: {
        'X-API-Key': window.wpApiSettings?.apiKey || ''
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('API response was not ok');
        return response.json();
      })
      .then(data => console.log('Auction API Data:', data))
      .catch(error => {
        console.error('API Error:', error);
        setError(error.message);
      });
  }, [currentUserId, currentUserName, auction, id]);

  // auctions-ის მონაცემების შემოწმება
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

  // გვერდის სათაური და თუ visibillity aris false
  useEffect(() => {
    if (!auction) return;

    // directamente davabrunot tu visibility aris false
    if (auction.meta?.visibility === false) {
      setError('auction_not_visible');
      return;
    }

    if (auction?.title?.rendered) {
      const cleanTitle = auction.title.rendered.replace(/<[^>]*>/g, '');
      document.title = `${cleanTitle}`;
    } else {
      document.title = 'აუქციონის დეტალები | აუქციონი';
    }

    return () => {
      document.title = 'აუქციონი';
    };
  }, [auction]);

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
          'X-WP-Nonce': window.bidspaceSettings.restNonce,
          'X-API-Key': window.wpApiSettings?.apiKey || ''
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
          'X-WP-Nonce': window.bidspaceSettings.restNonce,
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        },
        body: JSON.stringify({ bid_amount: bidAmount })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit bid');
      }

      const bidData = await response.json();

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

  const handleAuctionEnd = async () => {
    try {
      const response = await fetch(`${window.location.origin}/wp-json/wp/v2/auction/${id}/notify-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings.restNonce,
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        }
      });

      if (!response.ok) {
        console.error('Failed to send winner notification');
      }
    } catch (error) {
      console.error('Error sending winner notification:', error);
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

  // თუ აუქციონი არ არსებობს ან არ არის ხილვადი
  if (!auction || auction.meta?.visibility === false) {
    return (
      <div className="w-full min-h-screen flex items-centerjustify-center bg-[#E6E6E6]">
        <div className="text-center text-gray-600">
          <p>აუქციონი არ არის ხელმისაწვდომი</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#009bd6] transition-colors"
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
          {/* Tabs container - visible only on desktop */}
          <div className="hidden lg:block bg-white rounded-lg p-3 sm:p-4 shadow">
            <div className="flex border-b mb-4">
              <button
                className={`py-2 px-4 ${activeTab === 'description' ? 'border-b-2 border-[#00aeef] text-[#00AEEF]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('description')}
              >
                აღწერა
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'bids' ? 'border-b-2 border-[#00aeef] text-[#00AEEF]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('bids')}
              >
                ბიდების ისტორია
              </button>
            </div>
            {activeTab === 'description' ? (
              <div className="h-[250px] sm:max-h-60 overflow-y-auto">
                <AuctionDescription auction={auction} />
              </div>
            ) : (
              <AuctionBidsList bids={currentBids} />
            )}
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
            onAuctionEnd={handleAuctionEnd}
          />
        </div>
      </div>

      {/* Tabs container for mobile devices */}
      <div className="lg:hidden w-full bg-white rounded-2xl p-3 sm:p-4">
        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 ${activeTab === 'description' ? 'border-b-2 border-[#00AEEF] text-[#00AEEF]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('description')}
          >
            აღწერა
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'bids' ? 'border-b-2 border-[#00AEEF] text-[#00AEEF]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bids')}
          >
            ბიდების ისტორია
          </button>
        </div>
        {activeTab === 'description' ? (
          <AuctionDescription auction={auction} />
        ) : (
          <AuctionBidsList bids={currentBids} />
        )}
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