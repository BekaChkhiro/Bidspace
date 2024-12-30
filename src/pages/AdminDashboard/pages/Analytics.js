import React from 'react';

const Analytics = () => (
  <div className="bg-white p-6 rounded-lg">
    <h2 className="text-xl font-semibold mb-4">ანალიტიკა</h2>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">მომხმარებლების აქტივობა</h3>
          <p className="text-gray-500">აქტიური მომხმარებლების რაოდენობა დროის მიხედვით</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">გაყიდვების ანალიზი</h3>
          <p className="text-gray-500">გაყიდვების სტატისტიკა და ტრენდები</p>
        </div>
      </div>
    </div>
  </div>
);

export default Analytics;
