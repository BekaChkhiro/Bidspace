import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Outer circle */}
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full border-4 border-primary-200 border-b-primary-600 animate-spin"></div>
        </div>
      </div>
      <span className="ml-4 text-lg text-gray-600">იტვირთება...</span>
    </div>
  );
};

export default LoadingSpinner;
