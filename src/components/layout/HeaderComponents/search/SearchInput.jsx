import React, { useState, useEffect } from 'react';
import calendarIcon from '../../../assets/icons/search/mdi_calendar.svg';
import locationIcon from '../../../assets/icons/search/mdi_location.svg';
import { Link } from 'react-router-dom';

const SearchInput = ({ variant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featuredImages, setFeaturedImages] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchAllAuctions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const initialResponse = await fetch(`${window.location.origin}/wp-json/wp/v2/auction?per_page=100&page=1`);
        const totalPagesCount = parseInt(initialResponse.headers.get('X-WP-TotalPages'));
        setTotalPages(totalPagesCount);

        const allAuctionsPromises = [];
        for (let page = 1; page <= totalPagesCount; page++) {
          const promise = fetch(`${window.location.origin}/wp-json/wp/v2/auction?per_page=100&page=${page}`)
            .then(response => response.json());
          allAuctionsPromises.push(promise);
        }

        const allPagesResults = await Promise.all(allAuctionsPromises);
        const combinedAuctions = allPagesResults.flat();
        setAuctions(combinedAuctions);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAuctions();
  }, []);

  useEffect(() => {
    const fetchFeaturedImages = async (auctions) => {
      const imagePromises = auctions.map(async (auction) => {
        if (auction.featured_media) {
          const response = await fetch(`${window.location.origin}/wp-json/wp/v2/media/${auction.featured_media}`);
          const data = await response.json();
          return { id: auction.id, imageUrl: data.source_url };
        }
        return { id: auction.id, imageUrl: '' };
      });

      const images = await Promise.all(imagePromises);
      const imagesMap = {};
      images.forEach(img => {
        imagesMap[img.id] = img.imageUrl;
      });
      setFeaturedImages(imagesMap);
    };

    if (auctions.length > 0) {
      fetchFeaturedImages(auctions);
    }
  }, [auctions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-result-card') && !event.target.closest('form')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAuctionClick = () => {
    setShowResults(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = auctions.filter(auction =>
        auction.title.rendered.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      setFilteredAuctions(filtered);
      setShowResults(true);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim()) {
      setFilteredAuctions([]);
      setShowResults(false);
    } else {
      const filtered = auctions.filter(auction =>
        auction.title.rendered.toLowerCase().includes(value.toLowerCase().trim())
      );
      setFilteredAuctions(filtered);
      setShowResults(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = {
      'January': 'იანვარი',
      'February': 'თებერვალი',
      'March': 'მარტი',
      'April': 'აპრილი',
      'May': 'მაისი',
      'June': 'ივნისი',
      'July': 'ივლისი',
      'August': 'აგვისტო',
      'September': 'სექტემბერი',
      'October': 'ოქტომბერი',
      'November': 'ნოემბერი',
      'December': 'დეკემბერი'
    };

    const englishDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let [month, day, year] = englishDate.split(' ');
    month = month.replace(',', '');
    day = day.replace(',', '');
    
    return `${day} ${months[month]}, ${year}`;
  };

  const displayedAuctions = showAll ? filteredAuctions : filteredAuctions.slice(0, 3);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim()) {
              setShowResults(true);
            }
          }}
          placeholder="ძიება"
          className={`w-full px-4 py-2.5 pr-10 rounded-full focus:outline-none shadow-sm ${
            variant === 'sidebar' ? 'bg-[#dadada]' : 'bg-white'
          }`}
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </button>
      </form>

      {showResults && searchQuery && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg max-h-[70vh] md:max-h-96 overflow-y-auto z-[9999] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center">იტვირთება...</div>
          ) : error ? (
            <div className="px-4 py-3 text-red-500 text-center">{error}</div>
          ) : filteredAuctions.length > 0 ? (
            <>
              <div className="divide-y divide-gray-100">
                {displayedAuctions.map((auction) => (
                  <Link
                    key={auction.id}
                    to={`/auction/${auction.id}`}
                    className="search-result-card block hover:bg-gray-50 px-3 py-2.5 md:p-3"
                    onClick={handleAuctionClick}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={featuredImages[auction.id]} 
                        alt={auction.title.rendered} 
                        className="w-14 h-14 md:w-16 md:h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0 gap-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                          {auction.title.rendered}
                        </h3>
                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <img src={calendarIcon} alt="date icon" className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>{formatDate(auction.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <img src={locationIcon} alt="map icon" className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>{auction.meta.city}</span>
                          </div>
                        </div>
                        <div className="text-xs md:text-sm font-semibold text-gray-900">
                          მიმდინარე ფასი: {auction.meta.auction_price}₾
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredAuctions.length > 3 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-2.5 text-sm text-center text-gray-600 hover:bg-gray-50 border-t"
                >
                  მეტის ნახვა ({filteredAuctions.length - 3})
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              აუქციონი ვერ მოიძებნა
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;