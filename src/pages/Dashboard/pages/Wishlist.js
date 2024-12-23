import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from "../../../components/ui/use-toast";
import AuctionItem from '../components/common/AuctionItem';

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
            <div className="border p-4 rounded">
              <p className="text-[#6F7181]">სურვილების სია ცარიელია</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishlistAuctions.map((auction) => (
                <AuctionItem
                  key={auction.id}
                  auction={auction}
                  onDeleteClick={removeFromWishlist}
                  editLink={`/auction/${auction.id}`}
                  editText="ნახვა"
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

export default Wishlist;
