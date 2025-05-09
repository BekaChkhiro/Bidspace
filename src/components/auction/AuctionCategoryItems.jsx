import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '../ui/carousel';
import cinemaImage from '../assets/images/auction-categories/cinema_category_image.png';
import eventsImage from '../assets/images/auction-categories/events_category_image.png';
import sportImage from '../assets/images/auction-categories/sport_category_image.png';
import travelImage from '../assets/images/auction-categories/travel_category_image.png';
import menuIcon from '../assets/icons/menu_icon.svg';

const AuctionCategoryItems = () => {
  const location = useLocation();
  const carouselRef = useRef(null);
  
  const getActiveStyle = (path) => {
    const currentPath = location.pathname.replace(/\/$/, '');
    const categoryPath = path.replace(/\/$/, '');
    
    return currentPath === categoryPath ? {
      backgroundColor: '#00adef29',
      border: '1px solid #00adef'
    } : {};
  };

  const categoryItems = [
    { path: '/auction', title: 'ყველა კატეგორია', icon: menuIcon },
    { path: '/theater_cinema', title: 'თეატრი-კინო', image: cinemaImage },
    { path: '/events', title: 'ივენთები', image: eventsImage },
    { path: '/sport', title: 'სპორტი', image: sportImage },
    { path: '/travel', title: 'მოგზაურობა', image: travelImage },
  ];

  const scrollToActiveItem = () => {
    if (window.innerWidth <= 768) {
      const activeItemIndex = categoryItems.findIndex(
        item => item.path.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')
      );
      
      if (activeItemIndex !== -1 && carouselRef.current) {
        const scrollContainer = carouselRef.current.querySelector('[role="region"]');
        if (scrollContainer) {
          const itemWidth = scrollContainer.offsetWidth * 0.4; // 40% as defined in basis-[40%]
          const scrollPosition = activeItemIndex * itemWidth - (scrollContainer.offsetWidth - itemWidth) / 2;
          scrollContainer.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  useEffect(() => {
    // Initial scroll after a short delay to ensure layout is ready
    const initialScrollTimeout = setTimeout(scrollToActiveItem, 200);
    
    // Add resize listener to handle orientation changes
    window.addEventListener('resize', scrollToActiveItem);
    
    return () => {
      clearTimeout(initialScrollTimeout);
      window.removeEventListener('resize', scrollToActiveItem);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:flex w-full justify-between items-stretch gap-7">
        {categoryItems.map(item => (
          <Link 
            key={item.path}
            to={item.path} 
            className="w-1/5 px-7 py-7 flex flex-col gap-7 items-center justify-top rounded-3xl h-36 bg-gray-300 bg-no-repeat bg-right-bottom"
            style={{ 
              ...getActiveStyle(item.path),
              ...(item.image && { backgroundImage: `url(${item.image})`, backgroundSize: '70px' })
            }}
          >
            <span className="text-sm xl:text-xl text-gray-900">{item.title}</span>
            {item.icon && <img src={item.icon} className="w-9 h-9" alt="menu_icon" />}
          </Link>
        ))}
      </div>

      {/* Mobile version */}
      <div className="md:hidden w-full">
        <Carousel 
          ref={carouselRef}
          opts={{
            dragFree: true,
            containScroll: "trimSnaps",
            skipSnaps: false,
            align: 'center',
            breakpoints: {
              '(max-width: 768px)': { slidesToShow: 2.5 }
            }
          }} 
          className="overflow-hidden pb-4"
        >
          <CarouselContent className="-ml-2">
            {categoryItems.map((item) => (
              <CarouselItem key={item.path} className="pl-2 basis-[40%]">
                <Link 
                  to={item.path} 
                  className="block w-full px-3 py-3 flex flex-col gap-3 items-center justify-top rounded-2xl h-[80px] bg-gray-300 bg-no-repeat bg-right-bottom"
                  style={{ 
                    ...getActiveStyle(item.path),
                    ...(item.image && { backgroundImage: `url(${item.image})`, backgroundSize: '45px' })
                  }}
                >
                  <span className="text-xs text-gray-900 text-center">{item.title}</span>
                  {item.icon && <img src={item.icon} className="w-6 h-6" alt="menu_icon" />}
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </>
  );
};

export default AuctionCategoryItems;