import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import StatusBadge from './StatusBadge';
import { formatDate } from './utils';

const RecentAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentAuctions();
  }, []);

  const fetchRecentAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/wp-json/wp/v2/auction?per_page=5&orderby=date&order=desc&_embed', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': window.wpApiSettings?.apiKey || '',
          'X-WP-Admin': 'true'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('ბოლოს დამატებული აუქციონების ჩატვირთვა ვერ მოხერხდა');
      }
      
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">ბოლოს დამატებული აუქციონები</h2>
                <Link
                    to="/admin/auctions"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                    <span>ყველა აუქციონი</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>

        <div className="overflow-x-auto">
            <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                აუქციონი
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                სტატუსი
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ფასი
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                თარიღი
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                სტატუსი
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {auctions.map((auction) => (
                            <tr key={auction.id} className="group hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-3 sm:px-6 py-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                                <img 
                                                    src={auction._embedded['wp:featuredmedia'][0].source_url}
                                                    alt=""
                                                    className="h-full w-full object-cover rounded-md"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {auction.title.rendered}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3">
                                    <StatusBadge startTime={auction.meta.start_time} dueTime={auction.meta.due_time} />
                                </td>
                                <td className="px-3 sm:px-6 py-3 text-sm text-gray-500">
                                    ₾{auction.meta.auction_price}
                                </td>
                                <td className="px-3 sm:px-6 py-3 text-sm text-gray-500">
                                    {formatDate(auction.meta.start_time)}
                                </td>
                                <td className="px-3 sm:px-6 py-3">
                                    {auction.meta.visibility ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            დადასტურებული
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            დასადასტურებელი
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden">
                <div className="space-y-4 p-4">
                    {auctions.map((auction) => (
                        <div key={auction.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="h-16 w-16 flex-shrink-0">
                                    {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                        <img 
                                            src={auction._embedded['wp:featuredmedia'][0].source_url}
                                            alt=""
                                            className="h-full w-full object-cover rounded-md"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {auction.title.rendered}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ₾{auction.meta.auction_price}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <div className="text-xs text-gray-500">
                                    {formatDate(auction.meta.start_time)}
                                </div>
                                <StatusBadge startTime={auction.meta.start_time} dueTime={auction.meta.due_time} />
                            </div>
                            
                            <div className="pt-2 border-t border-gray-100">
                                {auction.meta.visibility ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        დადასტურებული
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        დასადასტურებელი
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
};

export default RecentAuctions;