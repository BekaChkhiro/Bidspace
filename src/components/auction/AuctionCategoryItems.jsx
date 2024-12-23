import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import cinemaImage from '../assets/images/auction-categories/cinema_category_image.png';
import eventsImage from '../assets/images/auction-categories/events_category_image.png';
import sportImage from '../assets/images/auction-categories/sport_category_image.png';
import travelImage from '../assets/images/auction-categories/travel_category_image.png';
import menuIcon from '../assets/icons/menu_icon.svg';

const AuctionCategoryItems = () => {
  const location = useLocation();
  
  const getActiveStyle = (path) => {
    return location.pathname === path ? {
      backgroundColor: '#00adef29',
      border: '1px solid #00adef'
    } : {};
  };

  return (
    <div className="w-full flex justify-between items-stretch gap-7">
      <Link 
        to="/auction" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center rounded-3xl bg-gray-300"
        style={getActiveStyle('/auction')}
      >
        <span className="text-sm xl:text-xl text-gray-900">ყველა კატეგორია</span>
        <img src={menuIcon} className="w-9 h-9" alt="menu_icon" />
      </Link>

      <Link 
        to="/theater_cinema" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom" 
        style={{ 
          ...getActiveStyle('/theater_cinema'),
          backgroundImage: `url(${cinemaImage})`, 
          backgroundSize: '70px' 
        }}
      >
        <span className="text-sm xl:text-xl text-gray-900">თეატრი-კინო</span>
      </Link>

      <Link 
        to="/events" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ 
          ...getActiveStyle('/events'),
          backgroundImage: `url(${eventsImage})`, 
          backgroundSize: '70px' 
        }}
      >
        <span className="text-sm xl:text-xl text-gray-900">ივენთები</span>
      </Link>

      <Link 
        to="/sport" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ 
          ...getActiveStyle('/sport'),
          backgroundImage: `url(${sportImage})`, 
          backgroundSize: '70px' 
        }}
      >
        <span className="text-sm xl:text-xl text-gray-900">სპორტი</span>
      </Link>

      <Link 
        to="/travel" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ 
          ...getActiveStyle('/travel'),
          backgroundImage: `url(${travelImage})`, 
          backgroundSize: '70px' 
        }}
      >
        <span className="text-sm xl:text-xl text-gray-900">მოგზაურობა</span>
      </Link>
    </div>
  );
};

export default AuctionCategoryItems;