import React from 'react';

const StatusBadge = ({ startTime, dueTime }) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const due = new Date(dueTime).getTime();

  if (now < start) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        მოლოდინში
      </span>
    );
  } else if (now >= start && now <= due) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        აქტიური
      </span>
    );
  } else {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
        დასრულებული
      </span>
    );
  }
};

export default StatusBadge;