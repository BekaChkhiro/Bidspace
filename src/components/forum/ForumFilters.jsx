import React from 'react';

const ForumFilters = ({ onSortChange, sortBy }) => {
    return (
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
            <label className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">დალაგება:</label>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="date">თარიღის მიხედვით</option>
                <option value="likes">მოწონებების მიხედვით</option>
                <option value="views">ნახვების მიხედვით</option>
                <option value="comments">კომენტარების მიხედვით</option>
            </select>
        </div>
    );
};

export default ForumFilters;