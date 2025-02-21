import React from 'react';

const MyLikes = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">მოწონებული პოსტები</h1>
      <div className="space-y-4">
        {/* User's liked posts will be listed here */}
        <div className="likes-list">
          {/* This will be populated with actual data */}
        </div>
      </div>
    </div>
  );
};

export default MyLikes;