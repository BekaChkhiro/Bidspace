import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="p-4 text-red-700 bg-red-100 rounded-lg">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;