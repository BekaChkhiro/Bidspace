import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import MapIcon from '../../../icons/auction/location.svg';
import DateIcon from '../../../icons/auction/date_icon.svg';
import { useToast } from "../../../components/ui/use-toast";

const Wishlist = () => {
  const [wishlistAuctions, setWishlistAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchWishlistAuctions();
    }
  }, [user]);

  const fetchWishlistAuctions = async () => {
    try {
      const userResponse = await fetch(`/wp-json/wp/v2/users/me`, {
        headers: {
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });
      const userData = await userResponse.json();
      const wishlistIds = userData.wishlist || [];

      if (!wishlistIds.length) {
        setWishlistAuctions([]);
        setLoading(false);
        return;
      }

      const auctionsPromises = wishlistIds.map(id => 
        fetch(`/wp-json/wp/v2/auction/${id}`, {
          headers: {
            'X-WP-Nonce': window.wpApiSettings?.nonce
          }
        }).then(res => res.json())
      );

      const auctions = await Promise.all(auctionsPromises);
      const validAuctions = auctions.filter(auction => auction.id);
      console.log('Received wishlist auctions data:', validAuctions);
      setWishlistAuctions(validAuctions);
    } catch (error) {
      console.error('Error fetching wishlist auctions:', error);
      toast({
        description: "სურვილების სიის ჩატვირთვისას მოხდა შეცდომა",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (auctionId) => {
    try {
      const response = await fetch(`/wp-json/custom/v1/wishlist/toggle/${auctionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });

      if (response.ok) {
        toast({
          description: "აუქციონი წაიშალა სურვილების სიიდან",
        });
        fetchWishlistAuctions(); // Refresh the list
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        description: "შეცდომა აუქციონის წაშლისას",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">სურვილების სია</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div className="text-center">
              <p className="text-[#6F7181]">იტვირთება...</p>
            </div>
          ) : wishlistAuctions.length === 0 ? (
            <div>
              <p className="text-[#6F7181]">სურვილების სია ცარიელია</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistAuctions.map((auction) => (
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
                    <Link 
                      to={`/auction/${auction.id}`}
                      className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md"
                    >
                      ნახვა
                    </Link>
                    <button 
                      onClick={() => removeFromWishlist(auction.id)}
                      className="bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-md"
                    >
                      წაშლა
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

export default Wishlist;
