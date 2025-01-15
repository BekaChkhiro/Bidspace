import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/auctions/LoadingSpinner';
import ErrorMessage from '../components/auctions/ErrorMessage';
import SearchInput from '../components/auctions/SearchInput';
import StatusBadge from '../components/auctions/StatusBadge';
import EditAuctionSidebar from '../components/auctions/EditAuctionSidebar';
import { formatDate } from '../components/auctions/utils';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const auctionsPerPage = 10;

  // Filter auctions based on search term
  const filteredAuctions = auctions.filter(auction => 
    auction.title.rendered.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current auctions for pagination
  const indexOfLastAuction = currentPage * auctionsPerPage;
  const indexOfFirstAuction = indexOfLastAuction - auctionsPerPage;
  const currentAuctions = filteredAuctions.slice(indexOfFirstAuction, indexOfLastAuction);
  const totalPages = Math.ceil(filteredAuctions.length / auctionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/wp-json/wp/v2/auction/?per_page=100&_embed');
      
      if (!response.ok) {
        throw new Error('აუქციონების ჩატვირთვა ვერ მოხერხდა');
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
    <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">აუქციონები</h2>
        <div className="w-full sm:w-auto">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Table Section */}
      <div className="-mx-4 sm:mx-0 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        აუქციონი
      </th>
      <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        სტატუსი
      </th>
      <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        ფასი
      </th>
      <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        თარიღი
      </th>
      <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
        მოქმედება
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {currentAuctions.map((auction) => (
      <tr key={auction.id} className="hover:bg-gray-50">
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
              <div className="sm:hidden space-y-1">
                <p className="hidden md:block text-xs text-gray-500">₾{auction.meta.auction_price}</p>
                <p className="hidden md:block text-xs text-gray-500">{formatDate(auction.meta.start_time)}</p>
                <StatusBadge startTime={auction.meta.start_time} dueTime={auction.meta.due_time} />
              </div>
            </div>
          </div>
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-6 py-3">
          <StatusBadge startTime={auction.meta.start_time} dueTime={auction.meta.due_time} />
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-sm text-gray-500">
          ₾{auction.meta.auction_price}
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-sm text-gray-500">
          {formatDate(auction.meta.start_time)}
        </td>
        <td className="px-3 sm:px-6 py-3 text-right">
          <button
            onClick={() => {
              setSelectedAuction(auction);
              setIsEditSidebarOpen(true);
            }}
            className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium bg-gray-50 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            ნახვა
          </button>
        </td>
      </tr>
    ))}
  </tbody>
      </table>
  
        {/* Mobile Pagination */}
        <div className="mt-4 sm:hidden px-3">
          <div className="flex justify-between">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border rounded-md disabled:opacity-50"
            >
              წინა
            </button>
            <span className="px-4 py-2 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border rounded-md disabled:opacity-50"
            >
              შემდეგი
            </button>
          </div>
        </div>
  
        {/* Desktop Pagination */}
        <div className="hidden sm:flex justify-between items-center mt-4 px-6">
          {/* ...existing pagination code... */}
        </div>
      </div>
  
      {isEditSidebarOpen && (
        <EditAuctionSidebar
          auction={selectedAuction}
          onClose={(wasUpdated) => {
            setIsEditSidebarOpen(false);
            setSelectedAuction(null);
            if (wasUpdated) {
              fetchAuctions();
            }
          }}
        />
      )}
    </div>
  );
};

export default Auctions;