import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import WinAuctionsIcon from '../../../assets/icons/dashboard/win_auctions_with_bg.svg';
import ActiveAuctionsIcon from '../../../assets/icons/dashboard/active_auctions_icon.svg';
import EndAuctionsIcon from '../../../assets/icons/dashboard/end_auctions_icon.svg';
import MapIcon from '../../../icons/auction/location.svg';
import DateIcon from '../../../icons/auction/date_icon.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    won: 0,
    active: 0,
    ended: 0
  });
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, auctionId: null, title: '' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAuctionStats();
    }
  }, [user]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchAuctionStats = async () => {
    if (!user) {
      console.log('No user found:', user);
      return;
    }

    try {
      console.log('Fetching auctions for user:', user);
      // Get all auctions
      const allResponse = await fetch('/wp-json/wp/v2/auction?per_page=100');
      if (!allResponse.ok) throw new Error('Failed to fetch all auctions');
      const allAuctions = await allResponse.json();

      // Get user's auctions
      const userResponse = await fetch(`/wp-json/wp/v2/auction?author=${user.id}&per_page=100`);
      if (!userResponse.ok) throw new Error('Failed to fetch user auctions');
      const userAuctions = await userResponse.json();
      
      setAuctions(userAuctions);
      
      console.log('All auctions:', allAuctions);
      console.log('User auctions:', userAuctions);
      
      // Filter won auctions from all auctions
      const wonAuctions = allAuctions.filter(auction => {
        const lastBidAuthorId = auction.meta?.last_bid_author_id;
        const userId = user.id;
        
        return lastBidAuthorId && 
               (lastBidAuthorId === userId.toString() || 
                parseInt(lastBidAuthorId) === userId);
      });

      // Calculate active and ended stats from user's auctions
      const currentDate = new Date();
      console.log('Current date:', currentDate);

      const activeAuctions = userAuctions.filter(auction => {
        const startTime = auction.meta?.start_time ? new Date(auction.meta.start_time) : null;
        const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;
        
        return dueTime && currentDate < dueTime && (!startTime || currentDate >= startTime);
      });

      const endedAuctions = userAuctions.filter(auction => {
        const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;
        return !dueTime || currentDate >= dueTime;
      });

      const newStats = {
        won: wonAuctions.length,
        active: activeAuctions.length,
        ended: endedAuctions.length
      };

      console.log('Won auctions:', wonAuctions);
      console.log('Active auctions:', activeAuctions.map(a => ({
        id: a.id,
        title: a.title.rendered,
        dueTime: a.meta?.due_time,
        meta: a.meta
      })));
      console.log('Ended auctions:', endedAuctions.map(a => ({
        id: a.id,
        title: a.title.rendered,
        dueTime: a.meta?.due_time,
        meta: a.meta
      })));
      console.log('Final stats:', newStats);
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching auction stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = auction.meta?.start_time ? new Date(auction.meta.start_time) : null;
    const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;

    if (startTime && now < startTime) {
      return 'planned';
    }
    
    if (dueTime && now < dueTime) {
      if (!startTime || now >= startTime) {
        return 'active';
      }
    }

    return 'ended';
  };

  const handleDeleteClick = (auctionId) => {
    const auction = auctions.find(a => a.id === auctionId);
    setDeleteModal({ show: true, auctionId, title: auction.title.rendered });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${deleteModal.auctionId}`, {
        method: 'DELETE',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (response.ok) {
        setToast({ 
          show: true, 
          message: `აუქციონი "${deleteModal.title}" წარმატებით წაიშალა`
        });
        fetchAuctionStats();
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
      setToast({ 
        show: true, 
        message: `შეცდომა აუქციონის "${deleteModal.title}" წაშლისას`
      });
    } finally {
      setDeleteModal({ show: false, auctionId: null, title: '' });
    }
  };

  const renderDeleteModal = () => {
    if (!deleteModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">აუქციონის წაშლა</h3>
          <p className="text-gray-600 mb-6">ნამდვილად გსურთ აუქციონის წაშლა?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setDeleteModal({ show: false, auctionId: null, title: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
            >
              გაუქმება
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
            >
              წაშლა
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderToast = () => {
    if (!toast.show) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-[#06afef] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
        {toast.message}
      </div>
    );
  };

  const renderAuctionsList = () => {
    const groupedAuctions = {
      planned: auctions.filter(auction => getAuctionStatus(auction) === 'planned'),
      active: auctions.filter(auction => getAuctionStatus(auction) === 'active'),
      ended: auctions.filter(auction => getAuctionStatus(auction) === 'ended')
    };

    const renderSection = (auctions, title, status) => {
      if (auctions.length === 0) return null;
      
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map(auction => (
              <div 
                key={auction.id} 
                className={`w-full flex flex-col gap-4 p-4 rounded-2xl ${
                  status === 'planned' 
                    ? 'bg-[#FFF4DE] border-2 border-[#FDB022]' 
                    : 'bg-[#E5ECF6]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{auction.title.rendered}</h3>
                  {status === 'planned' && (
                    <span className="px-3 py-1 bg-[#FDB022] text-white rounded-full text-sm">
                      დაგეგმილი
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-2/6 flex justify-start gap-3">
                    <img src={DateIcon} alt="date icon" />
                    <span className="text-[#6F7181]">{auction.meta.due_time}</span>
                  </div>
                  <div className="w-1/5 flex justify-start gap-3">
                    <img src={MapIcon} alt="map icon" />
                    <span className="text-[#6F7181]">{auction.meta.city}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Link 
                    to={`/dashboard/edit-auction/${auction.id}`} 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    რედაქტირება
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(auction.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    წაშლა
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div>
        {renderSection(groupedAuctions.planned, 'დაგეგმილი აუქციონები', 'planned')}
        {renderSection(groupedAuctions.active, 'მიმდინარე აუქციონები', 'active')}
        {renderSection(groupedAuctions.ended, 'დასრულებული აუქციონები', 'ended')}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <div className="w-full flex flex-col gap-3 p-6 bg-white rounded-2xl mb-6">
          <span className="text-lg font-bold">დღეს</span>
          <div className="w-full flex justify-between items-center gap-4">
            <div 
              className="w-1/3 flex flex-col gap-6 p-4 rounded-2xl" 
              style={{
                background: `url(${WinAuctionsIcon}), #DCFCE7`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">მოგებული აუქციონები</span>
              <span className="font-bold text-3xl">{stats.won}</span>
            </div>

            <div 
              className="w-1/3 flex flex-col gap-6 p-4 rounded-2xl"
              style={{
                background: `url(${ActiveAuctionsIcon}), #FFF4DE`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">მიმდინარე აუქციონები</span>
              <span className="font-bold text-3xl">{stats.active}</span>
            </div>

            <div 
              className="w-1/3 flex flex-col gap-4 p-6 rounded-2xl"
              style={{
                background: `url(${EndAuctionsIcon}), #F3E8FF`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '55px 55px',
                backgroundPosition: 'bottom 10px right 10px'
              }}
            >
              <span className="text-lg font-bold">დასრულებული აუქციონები</span>
              <span className="font-bold text-3xl">{stats.ended}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div className="text-center">
              <p className="text-[#6F7181]">იტვირთება...</p>
            </div>
          ) : auctions.length > 0 ? (
            renderAuctionsList()
          ) : (
            <div className="border p-4 rounded">
              <p className="text-[#6F7181]">ჯერ არ გაქვთ აუქციონები</p>
            </div>
          )}
        </div>
      </div>
      {renderDeleteModal()}
      {renderToast()}
    </DashboardLayout>
  );
};

export default Dashboard;