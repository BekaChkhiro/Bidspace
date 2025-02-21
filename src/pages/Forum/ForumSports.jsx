import React from 'react';

const ForumSports = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">სპორტი</h1>
      <div className="space-y-4">
        {/* Questions list will be rendered here */}
        <div className="questions-list">
          {/* This will be populated with actual data */}
        </div>
      </div>
    </div>
  );
};

export default ForumSports;