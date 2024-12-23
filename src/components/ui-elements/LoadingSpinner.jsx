import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 z-50">
      <div 
        className="h-full"
        style={{
          backgroundColor: 'rgb(0, 174, 239)',
          animation: 'loading 1s ease-in-out infinite',
          '@keyframes loading': {
            '0%': {
              width: '0%',
              marginLeft: '0%'
            },
            '50%': {
              width: '40%',
              marginLeft: '30%'
            },
            '100%': {
              width: '0%',
              marginLeft: '100%'
            }
          }
        }}
      />
    </div>
  );
};

export default LoadingSpinner;