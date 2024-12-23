import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../../../components/core/context/AuthContext';
import AuctionItem from '../components/common/AuctionItem';

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
                <AuctionItem
                  key={auction.id}
                  auction={auction}
                  isArchived={true}
                  onRestoreClick={restoreAuction}
                  showStatus={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Archive;
