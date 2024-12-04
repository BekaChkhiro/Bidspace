import React, { createContext, useContext, useState, useCallback } from 'react';

const AuctionContext = createContext();

export const AuctionProvider = ({ children }) => {
  const [auctions, setAuctions] = useState({});
  const [bidsList, setBidsList] = useState({});

  const updateAuction = useCallback((auctionId, newData) => {
    setAuctions(prev => ({
      ...prev,
      [auctionId]: {
        ...prev[auctionId],
        ...newData
      }
    }));
  }, []);

  const updateBidsList = useCallback((auctionId, newBids) => {
    console.log('Updating bids for auction:', auctionId, newBids);
    setBidsList(prev => ({
      ...prev,
      [auctionId]: newBids
    }));
  }, []);

  return (
    <AuctionContext.Provider 
      value={{
        auctions,
        bidsList,
        updateAuction,
        updateBidsList
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};