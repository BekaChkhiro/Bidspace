import React from 'react';

const Payments = () => (
  <div className="bg-white p-6 rounded-lg">
    <h2 className="text-xl font-semibold mb-4">გადახდები</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md">
            ფილტრი
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md">
            ექსპორტი
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="ძებნა..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* გადახდების ცხრილი */}
      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                გადახდის ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                მომხმარებელი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                თანხა
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                სტატუსი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                თარიღი
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Sample row */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #123456
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      გიორგი გიორგაძე
                    </div>
                    <div className="text-sm text-gray-500">
                      giorgi@email.com
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₾1,000
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  დასრულებული
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                2024-12-30
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Payments;
