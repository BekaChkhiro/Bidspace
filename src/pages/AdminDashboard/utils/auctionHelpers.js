import React from 'react';

export const getAuctionStatus = (auction) => {
  const now = new Date();
  const startTime = new Date(auction.meta.start_time);
  const dueTime = new Date(auction.meta.due_time);

  if (now < startTime) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დაგეგმილი
      </span>
    );
  } else if (now >= startTime && now <= dueTime) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        აქტიური
      </span>
    );
  } else {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        დასრულებული
      </span>
    );
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};
