import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
} from '../../../components/dropdown-menu';

const AuctionDetailsSidebar = ({ auction, onClose }) => {
  if (!auction) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      <div 
        className={`fixed inset-y-0 left-0 w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">აუქციონის დეტალები</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Featured Image */}
              {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={auction._embedded['wp:featuredmedia'][0].source_url}
                    alt={auction.title.rendered}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">სათაური</h3>
                <p className="mt-1 text-base font-medium text-gray-900">{auction.title.rendered}</p>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">სტატუსი</h3>
                <div className="mt-1">
                  {getAuctionStatus(auction)}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">საწყისი ფასი</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">₾{auction.meta.auction_price}</p>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">დაწყების დრო</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(auction.meta.start_time).toLocaleString('ka-GE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">დასრულების დრო</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(auction.meta.due_time).toLocaleString('ka-GE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              {auction.content && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">აღწერა</h3>
                  <div 
                    className="mt-2 prose prose-sm max-w-none text-gray-900" 
                    dangerouslySetInnerHTML={{ __html: auction.content.rendered }} 
                  />
                </div>
              )}

              {/* Meta Information */}
              {auction.meta && Object.entries(auction.meta)
                .filter(([key]) => !['auction_price', 'start_time', 'due_time'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-sm font-medium text-gray-500">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <p className="mt-1 text-sm text-gray-900">{value}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/auction/?per_page=100&_embed');
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('ნამდვილად გსურთ აუქციონის წაშლა?')) {
      return;
    }

    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${auctionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }

      setAuctions(auctions.filter(auction => auction.id !== auctionId));
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('აუქციონის წაშლა ვერ მოხერხდა');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ka-GE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = new Date(auction.meta.start_time);
    const dueTime = new Date(auction.meta.due_time);

    if (now < startTime) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დაგეგმილი
      </span>;
    } else if (now >= startTime && now <= dueTime) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        აქტიური
      </span>;
    } else {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        დასრულებული
      </span>;
    }
  };

  const filteredAuctions = auctions.filter(auction => 
    auction?.title?.rendered?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">აუქციონები</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="ძებნა..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                აუქციონი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                სტატუსი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ფასი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                თარიღი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                მოქმედება
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAuctions.map((auction) => (
              <tr key={auction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                      {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                        <img 
                          src={auction._embedded['wp:featuredmedia'][0].source_url}
                          alt={auction.title.rendered}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {auction.title.rendered}
                      </div>
                      <div className="text-sm text-gray-500">ID: #{auction.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAuctionStatus(auction)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₾{auction.meta.auction_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(auction.meta.start_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-500 transform rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel className="px-3 py-2 text-sm font-medium">მოქმედებები</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onSelect={() => {
                          setSelectedAuction(auction);
                          setIsSidebarOpen(true);
                        }}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                            />
                          </svg>
                          ნახვა
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onSelect={() => handleDeleteAuction(auction.id)}
                        className="w-full px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 text-red-600">
                          <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                          წაშლა
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isSidebarOpen && (
        <AuctionDetailsSidebar
          auction={selectedAuction}
          onClose={() => {
            setIsSidebarOpen(false);
            setSelectedAuction(null);
          }}
        />
      )}
    </div>
  );
};

export default Auctions;
