import React from 'react';

const Reports = () => (
  <div className="bg-white p-6 rounded-lg">
    <h2 className="text-xl font-semibold mb-4">რეპორტები</h2>
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h3 className="font-medium mb-2">თვიური ანგარიში</h3>
        <p className="text-gray-500">დეკემბრის თვის დეტალური ანგარიში</p>
        <button className="mt-2 text-blue-600 hover:underline">ჩამოტვირთვა PDF</button>
      </div>
      <div className="border-b pb-4">
        <h3 className="font-medium mb-2">კვარტალური ანგარიში</h3>
        <p className="text-gray-500">Q4 2024 დეტალური ანგარიში</p>
        <button className="mt-2 text-blue-600 hover:underline">ჩამოტვირთვა PDF</button>
      </div>
    </div>
  </div>
);

export default Reports;
