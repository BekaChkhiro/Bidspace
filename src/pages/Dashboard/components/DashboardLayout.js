import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import profileIcon from '../../../assets/icons/dashboard/profile_icon.svg';
import addAuctionIcon from '../../../assets/icons/dashboard/add_to_auction_icon.svg';
import myAuctionsIcon from '../../../assets/icons/dashboard/my_auctions_icon.svg';
import winAuctionsIcon from '../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import wishlistIcon from '../../../assets/icons/dashboard/my_wishlist_icon.svg';
import archiveIcon from '../../../assets/icons/dashboard/archive_icon.svg';
import settingsIcon from '../../../assets/icons/dashboard/setting_icon.svg';
import logoutIcon from '../../../assets/icons/dashboard/logout_icon.svg';
import bidspaceLogo from '../../../assets/images/bidspace_logo.png';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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

  const handleAuctionClick = () => {
    setShowResults(false);
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

  const getMenuItemClasses = (path) => {
    return location.pathname === path
      ? 'dashboard-menu-item-active w-full flex gap-2 items-center px-6 py-3 border-l-4 border-[#3B82F6] bg-[#F0F7FF]'
      : 'dashboard-menu-item w-full flex gap-2 items-center px-6 py-3 hover:border-l-4 hover:border-[#3B82F6] hover:bg-[#F0F7FF]';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="w-full h-[100vh] flex justify-center bg-[#F9F9F9]">
      {/* Left Sidebar */}
      <div className="w-1/6 h-full bg-white flex flex-col justify-between border-r border-[#E5E5E5] pb-6">
        <div className="flex flex-col gap-11">
          {/* Logo */}
          <div className="w-full h-24 p-6" style={{ height: '10%' }}>
            <Link to="/">
              <img src={bidspaceLogo} alt="Logo Icon" className="w-28" />
            </Link>
          </div>

          <div className="w-full flex flex-col gap-4">
            <nav className="w-full flex flex-col gap-2">
              <Link to="/dashboard" className={getMenuItemClasses('/dashboard')}>
                <img src={profileIcon} alt="Profile Icon" />
                <span className="font-normal text-base text-[#6F7181]">პროფილი</span>
              </Link>

              <Link to="/dashboard/add-auction" className={getMenuItemClasses('/dashboard/add-auction')}>
                <img src={addAuctionIcon} alt="Add Auction Icon" />
                <span className="font-normal text-base text-[#6F7181]">აუქციონის დამატება</span>
              </Link>

              <Link to="/dashboard/my-auctions" className={getMenuItemClasses('/dashboard/my-auctions')}>
                <img src={myAuctionsIcon} alt="My Auctions Icon" />
                <span className="font-normal text-base text-[#6F7181]">ჩემი აუქციონები</span>
              </Link>

              <Link to="/dashboard/won-auctions" className={getMenuItemClasses('/dashboard/won-auctions')}>
                <img src={winAuctionsIcon} alt="Won Auctions Icon" />
                <span className="font-normal text-base text-[#6F7181]">მოგებული აუქციონები</span>
              </Link>

              <Link to="/dashboard/wishlist" className={getMenuItemClasses('/dashboard/wishlist')}>
                <img src={wishlistIcon} alt="Wishlist Icon" />
                <span className="font-normal text-base text-[#6F7181]">სურვილების სია</span>
              </Link>
            </nav>

            <hr className="border-[#E5E5E5]" />

            <nav className="w-full flex flex-col gap-2">
              <Link to="/dashboard/archive" className={getMenuItemClasses('/dashboard/archive')}>
                <img src={archiveIcon} alt="Archive Icon" />
                <span className="font-normal text-base text-[#6F7181]">არქივი</span>
              </Link>

              <Link to="/dashboard/settings" className={getMenuItemClasses('/dashboard/settings')}>
                <img src={settingsIcon} alt="Settings Icon" />
                <span className="font-normal text-base text-[#6F7181]">პარამეტრები</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <button onClick={handleLogout} className="flex gap-2 items-center px-6 py-3 hover:bg-[#F0F7FF] w-full">
            <img src={logoutIcon} alt="Logout Icon" />
            <span className="font-normal text-base text-[#FB6B63]">გასვლა</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-5/6 h-full">
        {/* Top Header */}
        <div className="w-full p-6 border-b border-[#E5E5E5] flex justify-end items-center gap-6" style={{ height: '10%' }}>
          {/* Search Input */}
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
                className="w-full bg-white px-4 py-2 pr-10 rounded-full focus:outline-none"
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
                        onClick={handleAuctionClick}
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

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-[#6F7181]">{user?.name || 'User'}</span>
            </button>

            {isUserDropdownOpen && (
              <div className="user-dropdown">
                <Link to="/dashboard/profile" className="block">
                  პროფილი
                </Link>
                <Link to="/dashboard/settings" className="block">
                  პარამეტრები
                </Link>
                <button onClick={handleLogout} className="w-full text-left">
                  გასვლა
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 h-[90%] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;