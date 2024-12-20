import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';

const MyAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction?author=${user.id}`);
      const data = await response.json();
      console.log('Received auctions data:', data);
      setAuctions(data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (window.confirm('ნამდვილად გსურთ აუქციონის წაშლა?')) {
      try {
        const response = await fetch(`/wp-json/wp/v2/auction/${auctionId}`, {
          method: 'DELETE',
          headers: {
            'X-WP-Nonce': wpApiSettings.nonce
          }
        });

        if (response.ok) {
          alert('აუქციონი წარმატებით წაიშალა');
          fetchMyAuctions();
        }
      } catch (error) {
        console.error('Error deleting auction:', error);
        alert('შეცდომა აუქციონის წაშლისას');
      }
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">ჩემი აუქციონები</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <Link 
            to="/dashboard/add-auction" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/plus_icon.svg" alt="Add Icon" />
            ახალი აუქციონის დამატება
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center">
            <p className="text-[#6F7181]">იტვირთება...</p>
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map(auction => (
              <div key={auction.id} className="w-full flex flex-col gap-4 p-4 rounded-2xl bg-[#E5ECF6]">
                <h3 className="text-xl font-semibold mb-2">{auction.title.rendered}</h3>
                <div className="flex justify-between items-center">
                  <div className="w-2/6 flex justify-start gap-3">
                    <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/date_icon.svg" alt="date icon" />
                    <span className="text-[#6F7181]">{auction.meta.start_time}</span>
                  </div>
                  <div className="w-1/5 flex justify-start gap-3">
                    <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/map_icon.svg" alt="map icon" />
                    <span className="text-[#6F7181]">{auction.meta.city}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Link 
                    to={`/dashboard/edit-auction/${auction.id}`} 
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/edit_icon.svg" alt="Edit Icon" />
                    რედაქტირება
                  </Link>
                  <button 
                    onClick={() => handleDeleteAuction(auction.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                  >
                    <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/delete_icon.svg" alt="Delete Icon" />
                    წაშლა
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border p-4 rounded">
            <p className="text-[#6F7181]">ჯერ არ გაქვთ აუქციონები</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyAuctions;