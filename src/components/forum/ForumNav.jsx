import React from 'react';

const ForumNav = ({ navItems }) => {
    return (
        <nav className="w-64 bg-white p-4 space-y-2">
            {navItems.map((item, index) => (
                <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer
                        ${item.isActive ? 'bg-blue-50 text-blue-500' : 'hover:bg-gray-50'}`}
                >
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                </div>
            ))}
        </nav>
    );
};

export default ForumNav;