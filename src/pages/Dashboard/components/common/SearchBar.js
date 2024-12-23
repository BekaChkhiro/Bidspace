import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [featuredImages, setFeaturedImages] = useState({});

  useEffect(() => {
    const fetchAllAuctions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const initialResponse = await fetch(`${window.location.origin}/wp-json/wp/v2/auction?per_page=100&page=1`);
        const totalPagesCount = parseInt(initialResponse.headers.get('X-WP-TotalPages'));

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

  return (
    <div className="relative w-1/3">
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
          placeholder="ძებნა"
          className="w-full bg-white px-4 py-2 pr-10 rounded-full focus:outline-none border border-[#e5e5e5]"
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
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-[9999]">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              იტვირთება...
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-red-500 text-center">
              {error}
            </div>
          ) : filteredAuctions.length > 0 ? (
            <div>
              {filteredAuctions.map((auction) => (
                <Link
                  key={auction.id}
                  to={`/auction/${auction.id}`}
                  className="search-result-card block p-3 border-b hover:bg-gray-100"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-center">
                    <img src={featuredImages[auction.id]} alt={auction.title.rendered} className="w-16 h-16 rounded-lg mr-4" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#333]">{auction.title.rendered}</span>
                      <div className="flex items-center text-sm text-[#6F7181]">
                        <span className="mr-2">📅 {formatDate(auction.date)}</span>
                        <span>📍 {auction.location}</span>
                      </div>
                      <span className="text-sm text-[#333]">ბილეთის ფასი: {auction.price}₾</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              შედეგები არ მოიძებნა
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
