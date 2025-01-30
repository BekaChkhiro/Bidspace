import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ startTime, dueTime }) => {
  const now = new Date();
  const start = new Date(startTime);
  const due = new Date(dueTime);

  if (now < start) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დაგეგმილი
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
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        დასრულებული
      </span>
    );
  }
};

StatusBadge.propTypes = {
  startTime: PropTypes.string.isRequired,
  dueTime: PropTypes.string.isRequired,
};

export default StatusBadge;