import React, { useState } from 'react';
import axios from 'axios';

const PaymentButton = ({ auctionId, amount, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);
            
            const response = await axios.post('/wp-json/bidspace/v1/payment/initiate', {
                auction_id: auctionId,
                amount: amount
            }, {
                headers: {
                    'X-WP-Nonce': window.wpApiSettings.nonce,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success && response.data.links.redirect) {
                window.location.href = response.data.links.redirect;
            } else {
                throw new Error('გადახდის ინიციალიზაცია ვერ მოხერხდა');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            onError?.(error.response?.data?.message || 'გადახდის დროს მოხდა შეცდომა');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    გთხოვთ დაელოდოთ...
                </>
            ) : (
                <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    გადახდა
                </>
            )}
        </button>
    );
};

export default PaymentButton;