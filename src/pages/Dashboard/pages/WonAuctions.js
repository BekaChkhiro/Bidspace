import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const WonAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchWonAuctions = async () => {
            if (!user) {
                console.log('No user found:', user);
                return;
            }

            try {
                console.log('Fetching auctions for user:', user);
                const response = await fetch('/wp-json/wp/v2/auction?per_page=100');
                if (!response.ok) throw new Error('Failed to fetch auctions');
                
                const allAuctions = await response.json();
                console.log('All auctions:', allAuctions);
                
                // Filter auctions where current user is the last bidder
                const wonAuctions = allAuctions.filter(auction => {
                    const lastBidAuthorId = auction.meta?.last_bid_author_id;
                    const userId = user.id;
                    
                    return lastBidAuthorId && 
                           (lastBidAuthorId === userId.toString() || 
                            parseInt(lastBidAuthorId) === userId);
                });

                console.log('Won auctions:', wonAuctions);
                setAuctions(wonAuctions);
            } catch (error) {
                console.error('Error fetching won auctions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWonAuctions();
        }
    }, [user]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ka-GE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const content = loading ? (
        <LoadingSpinner />
    ) : (
        <>
            {auctions.length === 0 ? (
                <p className="text-gray-600">თქვენ ჯერ არ გაქვთ მოგებული აუქციონები</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {auctions.map(auction => (
                        <Link 
                            to={`/auction/${auction.id}`}
                            key={auction.id} 
                            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between"
                        >
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-bold" dangerouslySetInnerHTML={{ __html: auction.title.rendered }}></h2>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaCalendarAlt className="text-sm" />
                                    <span className="text-sm">{formatDate(auction.meta?.event_date || auction.date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaMapMarkerAlt className="text-sm" />
                                    <span className="text-sm">{auction.meta?.location || 'ბათუმი'}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col gap-2">
                                <div>
                                    <div className="text-sm text-gray-500">ბიდის ფასი:</div>
                                    <div className="font-bold text-lg">{auction.meta?.last_bid_price || auction.meta?.auction_price || 0}₾</div>
                                </div>
                                <div className="text-[#06afef]">
                                    გადახდა
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-6">მოგებული აუქციონები</h1>
            {content}
        </DashboardLayout>
    );
};

export default WonAuctions;
