import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useCustomToast from '../../toast/CustomToast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useCustomToast();

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/users/me', {
        headers: {
          'X-WP-Nonce': window.wpApiSettings?.nonce
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setWishlist(userData.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlistItem = async (auctionId) => {
    try {
      const response = await fetch(`/wp-json/custom/v1/wishlist/toggle/${auctionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce,
          'X-API-Key': window.wpApiSettings?.apiKey || ''
        }
      });

      if (response.ok) {
        const isInWishlist = wishlist.includes(Number(auctionId));
        const newWishlist = isInWishlist
          ? wishlist.filter(id => id !== Number(auctionId))
          : [...wishlist, Number(auctionId)];
        
        setWishlist(newWishlist);
        
        toast(isInWishlist ? 
          'აუქციონი წაიშალა სურვილების სიიდან' : 
          'აუქციონი დაემატა სურვილების სიაში'
        );
        return true;
      } else {
        throw new Error('Failed to toggle wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        description: "დაფიქსირდა შეცდომა",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      toggleWishlistItem,
      isInWishlist: (id) => wishlist.includes(Number(id))
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};