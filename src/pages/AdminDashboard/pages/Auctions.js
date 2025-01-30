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
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // Add this state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Update the filtering logic to include visibility
  const filteredAuctions = auctions.filter(auction => {
    // First filter by search term
    const matchesSearch = auction.title.rendered.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then filter by visibility if needed
    const matchesVisibility = visibilityFilter === 'all' ? true :
      visibilityFilter === 'visible' ? auction.meta.visibility === true :
      visibilityFilter === 'hidden' ? auction.meta.visibility === false : true;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' ? true :
      auction.meta.ticket_category === categoryFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' ? true :
      auction.meta.ticket_status === statusFilter;

    return matchesSearch && matchesVisibility && matchesCategory && matchesStatus;
  });

  // Filter options
  const categories = [
    { value: 'all', label: 'ყველა კატეგორია' },
    { value: 'თეატრი-კინო', label: 'თეატრი-კინო' },
    { value: 'ივენთები', label: 'ივენთები' },
    { value: 'სპორტი', label: 'სპორტი' },
    { value: 'მოგზაურობა', label: 'მოგზაურობა' }
  ];

  const statuses = [
    { value: 'all', label: 'ყველა სტატუსი' },
    { value: 'დაგეგმილი', label: 'დაგეგმილი' },
    { value: 'აქტიური', label: 'აქტიური' },
    { value: 'დასრულებული', label: 'დასრულებული' }
  ];

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
      
      const response = await fetch('/wp-json/wp/v2/auction?per_page=100&_embed', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': window.wpApiSettings?.apiKey || '',
          'X-WP-Admin': 'true'  // ეს ჰედერი მიუთითებს რომ მოთხოვნა ადმინ პანელიდან მოდის
        },
        credentials: 'include'
      });
      
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

  // Add visibility indicator in table row
  const getVisibilityBadge = (visibility) => {
    return visibility ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        დადასტურებული
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დასადასტურებელი
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">სულ აუქციონები</p>
              <p className="text-2xl font-semibold mt-1">{auctions.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">აქტიური</p>
              <p className="text-2xl font-semibold mt-1">
                {auctions.filter(a => a.meta.ticket_status === 'აქტიური').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">დაგეგმილი</p>
              <p className="text-2xl font-semibold mt-1">
                {auctions.filter(a => a.meta.ticket_status === 'დაგეგმილი').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">დასრულებული</p>
              <p className="text-2xl font-semibold mt-1">
                {auctions.filter(a => a.meta.ticket_status === 'დასრულებული').length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header & Search */}
        <div className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">აუქციონები</h2>
            <SearchInput 
              value={searchTerm} 
              onChange={setSearchTerm}
              className="w-full sm:w-64"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>ფილტრები:</span>
            </div>
            
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="text-sm rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 px-3 py-2"
            >
              <option value="all">ყველა სტატუსი</option>
              <option value="visible">დადასტურებული</option>
              <option value="hidden">დაუდასტურებელი</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 px-3 py-2"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 px-3 py-2"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <div className="flex-1 text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ნაპოვნია: {filteredAuctions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  სტატუსი
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მოქმედება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAuctions.map((auction) => (
                <tr 
                  key={auction.id} 
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
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
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3">
                    {getVisibilityBadge(auction.meta.visibility)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedAuction(auction);
                        setIsEditSidebarOpen(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      რედაქტირება
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                ნაჩვენებია <span className="font-medium">{indexOfFirstAuction + 1}</span>-<span className="font-medium">{Math.min(indexOfLastAuction, filteredAuctions.length)}</span>{' '}
                / <span className="font-medium">{filteredAuctions.length}</span>
              </p>
            </div>
            <div className="flex justify-between sm:justify-end gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                წინა
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                შემდეგი
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
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