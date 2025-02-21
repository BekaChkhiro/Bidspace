import React from 'react';

const MyResponses = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">ჩემი პასუხები</h1>
      <div className="space-y-4">
        {/* User's responses will be listed here */}
        <div className="responses-list">
          {/* This will be populated with actual data */}
        </div>
      </div>
    </div>
  );
};

export default MyResponses;