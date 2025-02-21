import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationMenu = () => {
  const menuItems = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66667 13.3333H13.3333M6.66667 9.99999H13.3333M6.66667 6.66666H13.3333M16.6667 3.33332V16.6667C16.6667 17.1087 16.4911 17.5326 16.1785 17.8452C15.866 18.1577 15.442 18.3333 15 18.3333H5C4.55797 18.3333 4.13405 18.1577 3.82149 17.8452C3.50893 17.5326 3.33333 17.1087 3.33333 16.6667V3.33332C3.33333 2.89129 3.50893 2.46737 3.82149 2.15481C4.13405 1.84225 4.55797 1.66666 5 1.66666H15C15.442 1.66666 15.866 1.84225 16.1785 2.15481C16.4911 2.46737 16.6667 2.89129 16.6667 3.33332Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "ფორუმის წესები",
      path: "/forum"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66667 5H13.3333M6.66667 8.33334H13.3333M6.66667 11.6667H10M4.16667 16.6667H15.8333C16.7538 16.6667 17.5 15.9205 17.5 15V5C17.5 4.07954 16.7538 3.33334 15.8333 3.33334H4.16667C3.24619 3.33334 2.5 4.07954 2.5 5V15C2.5 15.9205 3.24619 16.6667 4.16667 16.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "საერთო",
      path: "/forum/general"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 2.5V5.83333M6.66667 2.5V5.83333M3.33333 9.16667H16.6667M4.16667 4.16667H15.8333C16.2754 4.16667 16.6667 4.55794 16.6667 5V16.6667C16.6667 17.1087 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.33333 17.1087 3.33333 16.6667V5C3.33333 4.55794 3.72464 4.16667 4.16667 4.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "კინო-თეატრი",
      path: "/forum/cinema"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3333 5.83333V4.16667C13.3333 3.72464 13.1577 3.30072 12.8452 2.98816C12.5326 2.67559 12.1087 2.5 11.6667 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667V11.6667C2.5 12.1087 2.67559 12.5326 2.98816 12.8452C3.30072 13.1577 3.72464 13.3333 4.16667 13.3333H5.83333M11.6667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V8.33333C17.5 7.89131 17.3244 7.46738 17.0118 7.15482C16.6993 6.84226 16.2754 6.66667 15.8333 6.66667H11.6667C11.2246 6.66667 10.8007 6.84226 10.4882 7.15482C10.1756 7.46738 10 7.89131 10 8.33333V15.8333C10 16.2754 10.1756 16.6993 10.4882 17.0118C10.8007 17.3244 11.2246 17.5 11.6667 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "ივენთები",
      path: "/forum/events"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "სპორტი",
      path: "/forum/sports"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 7.5L10 2.5L17.5 7.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.5 17.5V10H12.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "მოგზაურობა",
      path: "/forum/travel"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 13.3333V10M10 6.66667H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "შენი კითხვები",
      path: "/forum/my-questions"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 8.33333H12.5M7.5 11.6667H10.8333M15.8333 17.5L12.5 15.8333H4.16667C3.72464 15.8333 3.30072 15.6577 2.98816 15.3452C2.67559 15.0326 2.5 14.6087 2.5 14.1667V5.83333C2.5 5.39131 2.67559 4.96738 2.98816 4.65482C3.30072 4.34226 3.72464 4.16667 4.16667 4.16667H15.8333C16.2754 4.16667 16.6993 4.34226 17.0118 4.65482C17.3244 4.96738 17.5 5.39131 17.5 5.83333V17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "პასუხები",
      path: "/forum/my-responses"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.91667 7.91666C7.91667 7.91666 8.75 6.66666 10 6.66666C12.0833 6.66666 12.0833 9.16666 10 9.16666C9.16667 9.16666 8.75 8.33333 8.75 8.33333M10 12.5H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "მოწონებები",
      path: "/forum/my-likes"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4.16666V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      text: "კითხვის დამატება",
      path: "/forum/add-question"
    }
  ];

  return (
    <nav className="w-64 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col space-y-1 p-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 p-2 rounded-lg cursor-pointer relative
              ${isActive 
                ? 'text-blue-500 bg-blue-50' 
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                )}
                <span className="w-5 h-5">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavigationMenu;