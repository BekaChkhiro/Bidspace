import React, { useState } from 'react';
import wonAuctionIcon from '../../assets/icons/auction/won_auction.svg';
import dateIcon from '../../assets/icons/auction/date_icon.svg';
import paymentArrowIcon from '../../assets/icons/auction/payment_arrow.svg';

const PaymentModal = ({ isOpen, onClose, amount, onConfirm, isProcessing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">გადახდა</h2>
        <div className="mb-4">
          <p className="text-gray-600">გადასახდელი თანხა:</p>
          <p className="text-2xl font-bold text-[#00AEEF]">{amount} ₾</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-[#00AEEF] text-white py-2 px-4 rounded-lg hover:bg-[#009bd6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'დამუშავება...' : 'გადახდა'}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  );
};

const EndedWonAuction = ({ auctionData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getLastBid = () => {
    if (!auctionData?.meta?.bids_list) return null;
    
    const bidsList = Array.isArray(auctionData.meta.bids_list) 
      ? auctionData.meta.bids_list
      : Object.values(auctionData.meta.bids_list);
    
    return bidsList.sort((a, b) => {
      const timeA = new Date(a.bid_time);
      const timeB = new Date(b.bid_time);
      return timeB - timeA;
    })[0];
  };

  const lastBid = getLastBid();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Check if payment is already completed
      if (auctionData.meta?.payment_status === 'completed') {
        setError('გადახდა უკვე განხორციელებულია');
        return;
      }

      if (!lastBid || !lastBid.bid_price) {
        setError('ბიდის თანხა ვერ მოიძებნა');
        return;
      }

      console.log('Initiating payment for auction:', {
        auctionId: auctionData.id,
        amount: lastBid.bid_price
      });

      // Initiate payment
      const response = await fetch('/wp-json/bidspace/v1/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-WP-Nonce': window.bidspaceSettings?.restNonce || '',
        },
        body: JSON.stringify({
          auction_id: auctionData.id,
          amount: lastBid.bid_price
        }),
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Payment API Response:', {
        status: response.status,
        text: responseText
      });

      if (!response.ok) {
        let errorMessage = 'გადახდის ინიციალიზაცია ვერ მოხერხდა';
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing success response:', e);
        throw new Error('გადახდის სერვისიდან მიღებულია არასწორი პასუხი');
      }

      // Check if we have valid redirect URL
      if (!data.links?.redirect) {
        console.error('Missing redirect URL in response:', data);
        throw new Error('გადახდის ბმული ვერ მოიძებნა');
      }

      // Redirect to BOG payment page
      console.log('Redirecting to payment page:', data.links.redirect);
      window.location.href = data.links.redirect;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'გადახდის დროს დაფიქსირდა შეცდომა');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ka-GE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full flex flex-col py-4 sm:py-6 gap-4 sm:gap-6">
      <div className="flex justify-center items-center gap-3 sm:gap-6 px-2 sm:px-0">
        <img src={wonAuctionIcon} alt="აუქციონი დასრულდა" className="w-8 h-8 sm:w-auto sm:h-auto" />
        <span className="font-normal text-sm sm:text-lg">გილოცავთ!</span>
      </div>

      <div className="w-full border-y p-3 sm:p-4 flex flex-col items-center gap-4 sm:gap-6">
        <span className="w-full font-bold text-sm sm:text-lg px-2 sm:px-0">
          {auctionData?.title?.rendered || 'აუქციონის სახელი'}
        </span>
        
        <div className="w-full flex flex-row overflow-x-auto gap-3 sm:gap-0 sm:justify-between items-center px-2 sm:px-0">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <img src={dateIcon} alt="თარიღის იკონი" className="w-4 h-4 sm:w-auto sm:h-auto" />
            <span className="text-[10px] sm:text-base whitespace-nowrap">
              {lastBid ? formatDate(lastBid.bid_time) : 'თარიღი არ არის'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-bold text-[10px] sm:text-base whitespace-nowrap">ავტორი: </span>
            <span className="text-[10px] sm:text-base whitespace-nowrap">{lastBid?.author_name || 'უცნობი'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-bold text-[10px] sm:text-base whitespace-nowrap">ფასი: </span>
            <span className="text-[10px] sm:text-base whitespace-nowrap">
              {lastBid ? `${lastBid.bid_price}₾` : '0₾'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {auctionData.meta?.payment_status === 'completed' ? (
              <span className="font-bold text-[10px] sm:text-base text-green-500 whitespace-nowrap">
                გადახდილია
              </span>
            ) : (
              <button 
                className="flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                <span className="font-bold text-[10px] sm:text-base text-[#00a9eb] whitespace-nowrap">
                  {isProcessing ? 'იტვირთება...' : 'გადახდა'}
                </span>
                <img src={paymentArrowIcon} alt="გადახდის იკონი" className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="w-full mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {auctionData.meta?.payment_status === 'pending' && (
          <div className="w-full mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm text-center">
              გთხოვთ გადაიხადოთ მოგებული ბილეთის საფასური 24 საათის განმავლობაში
            </p>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={lastBid?.bid_price}
        onConfirm={handlePayment}
        isProcessing={isProcessing}
      />

      {auctionData.meta?.payment_status !== 'completed' && (
        <button 
          onClick={() => setShowPaymentModal(true)}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 bg-[#00AEEF] text-white py-3 px-6 rounded-lg hover:bg-[#009bd6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>გადახდა</span>
          <img src={paymentArrowIcon} alt="გადახდის იკონი" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default EndedWonAuction;