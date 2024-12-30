import React from 'react';

const Notifications = () => (
  <div className="bg-white p-6 rounded-lg">
    <h2 className="text-xl font-semibold mb-4">შეტყობინებები</h2>
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="font-medium">ახალი აუქციონი დაემატა</p>
        <p className="text-sm text-gray-500">5 წუთის წინ</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <p className="font-medium">წარმატებული გაყიდვა</p>
        <p className="text-sm text-gray-500">30 წუთის წინ</p>
      </div>
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="font-medium">ახალი მომხმარებელი დარეგისტრირდა</p>
        <p className="text-sm text-gray-500">1 საათის წინ</p>
      </div>
    </div>
  </div>
);

export default Notifications;
