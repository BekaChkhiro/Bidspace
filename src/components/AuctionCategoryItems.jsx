import React from 'react';
import CinemaImage from '../images/auction-categories/cinema_category_image.png';
import EventImage from '../images/auction-categories/events_category_image.png';
import SportImage from '../images/auction-categories/sport_category_image.png';
import TravelImage from '../images/auction-categories/travel_category_image.png';
import MenuIcon from '../icons/menu_icon.svg';
import { Link } from 'react-router-dom';

const AuctionCategoryItems = () => {
  return (
    <div className="w-full flex justify-between items-stretch gap-7">
      <Link to="/auction" className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center rounded-3xl bg-gray-300">
        <span className="text-sm xl:text-xl text-gray-900">ყველა კატეგორია</span>
        <img src={MenuIcon} className="w-9 h-9" alt="menu_icon" />
      </Link>

      <Link 
        to="/theater_cinema" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom" 
        style={{ backgroundImage: `url(${CinemaImage})`, backgroundSize: '70px' }}
      >
        <span className="text-sm xl:text-xl text-gray-900">თეატრი-კინო</span>
      </Link>

      <Link 
        to="/events" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ backgroundImage: `url(${EventImage})`, backgroundSize: '70px' }}
      >
        <span className="text-sm xl:text-xl text-gray-900">ივენთები</span>
      </Link>

      <Link 
        to="/sport" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ backgroundImage: `url(${SportImage})`, backgroundSize: '70px' }}
      >
        <span className="text-sm xl:text-xl text-gray-900">სპორტი</span>
      </Link>

      <Link 
        to="/travel" 
        className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
        style={{ backgroundImage: `url(${TravelImage})`, backgroundSize: '70px' }}
      >
        <span className="text-sm xl:text-xl text-gray-900">მოგზაურობა</span>
      </Link>
    </div>
  );
};

export default AuctionCategoryItems;