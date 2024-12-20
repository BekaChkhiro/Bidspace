import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import MapIcon from '../../../icons/auction/location.svg';
import DateIcon from '../../../icons/auction/date_icon.svg';
import { FaUndo } from 'react-icons/fa';

const Archive = () => {
  const [archivedAuctions, setArchivedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchArchivedAuctions();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchArchivedAuctions = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction?author=${user.id}&status=trash`, {
        headers: {
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });
      const data = await response.json();
      console.log('Received archived auctions data:', data);
      setArchivedAuctions(data);
    } catch (error) {
      console.error('Error fetching archived auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreAuction = async (auctionId) => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${auctionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce
        },
        body: JSON.stringify({
          status: 'publish'
        })
      });

      if (response.ok) {
        setToast({ show: true, message: 'აუქციონი წარმატებით აღდგა' });
        fetchArchivedAuctions();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to restore auction');
      }
    } catch (error) {
      console.error('Error restoring auction:', error);
      setToast({ show: true, message: 'შეცდომა აუქციონის აღდგენისას' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">არქივი</h1>
        
        {toast.show && (
          <div className="fixed bottom-4 right-4 bg-[#06afef] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
            {toast.message}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div className="text-center">
              <p className="text-[#6F7181]">იტვირთება...</p>
            </div>
          ) : archivedAuctions.length === 0 ? (
            <div>
              <p className="text-[#6F7181]">წაშლილი აუქციონები არ მოიძებნა</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archivedAuctions.map((auction) => (
                <div 
                  key={auction.id} 
                  className="w-full flex flex-col gap-4 p-4 rounded-2xl bg-[#E5ECF6]"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{auction.title.rendered}</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-2/6 flex justify-start gap-3">
                      <img src={DateIcon} alt="date icon" />
                      <span className="text-[#6F7181]">{auction.meta?.due_time || 'თარიღი არ არის'}</span>
                    </div>
                    <div className="w-1/5 flex justify-start gap-3">
                      <img src={MapIcon} alt="map icon" />
                      <span className="text-[#6F7181]">{auction.meta?.city || 'მდებარეობა არ არის'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => restoreAuction(auction.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <FaUndo className="w-4 h-4" />
                      აღდგენა
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Archive;
