import React from 'react';
import bidspaceLogo from '../../../assets/images/bidspace_logo.png';
import languageIcon from '../../../assets/icons/header/language_icon.svg';
import SearchInput from '../search/SearchInput';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import UserProfileDropdown from '../user/UserProfileDropdown';

const Header = ({ onLoginClick }) => {
  const { isAuthenticated, user } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className='w-full px-16 py-4 flex gap-12 items-center header-bg'>
      <div className='w-4/12 flex justify-between items-center'>
        <div className='w-1/3'>
          <Link to='/'>
            <img src={bidspaceLogo} alt='Bidspace Logo' />
          </Link>
        </div>
        <div className='w-2/3'>
          <SearchInput />
        </div>
      </div>

      <nav className='w-4/12 flex justify-center'>
        <ul className='flex gap-8'>
          <li>
            <Link to='/forum' className='text-black text-lg font-bold hover:text-[#00adef] transition-colors'>
              ფორუმი
            </Link>
          </li>
          <li>
            <Link to='/questions' className='text-black text-lg font-bold hover:text-[#00adef] transition-colors'>
              შეკითხვები
            </Link>
          </li>
          <li>
            <Link to='/instruction' className='text-black text-lg font-bold hover:text-[#00adef] transition-colors'>
              ინსტრუქცია
            </Link>
          </li>
        </ul>
      </nav>

      <div className='w-4/12 flex justify-end gap-4 items-center'>
        <button className='flex items-center py-2 px-4 gap-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors'>
          <img 
            className='w-6 h-6' 
            src={languageIcon} 
            alt='Language Icon' 
          />
          <span className="font-medium">ქარ</span>
        </button>

        {isAuthenticated ? (
          <UserProfileDropdown user={user} />
        ) : (
          <button 
            onClick={onLoginClick}
            className="py-2 px-8 bg-black text-white rounded-full hover:bg-gray-900 transition-colors text-base font-medium"
          >
            შესვლა
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;