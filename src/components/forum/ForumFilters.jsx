import React from 'react';

const ForumFilters = ({ onSortChange, sortBy }) => {
    return (
        <div className="flex items-center space-x-4">
            <label className="text-gray-600 text-sm">დალაგება:</label>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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