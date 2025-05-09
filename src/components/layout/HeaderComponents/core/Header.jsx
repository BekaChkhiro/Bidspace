import React from 'react';
import bidspaceLogo from '../../../assets/images/bidspace_logo.png';
import languageIcon from '../../../assets/icons/header/language_icon.svg';
import SearchInput from '../search/SearchInput';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import UserProfileDropdown from '../user/UserProfileDropdown';
import { HiMenu, HiX } from 'react-icons/hi'; // Add this import
import MobileSidebar from '../mobile/MobileSidebar';
import AdminLoginButton from '../auth/AdminLoginButton';

const Header = ({ onLoginClick }) => {
  const { isAuthenticated, user } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Add console log to debug
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <header className='w-full px-4 md:px-8 lg:px-16 py-4 flex flex-wrap md:flex-nowrap gap-4 md:gap-8 lg:gap-12 items-center header-bg z-[50] sticky top-0 shadow-sm !bg-[#dadada]'>
        <div className='w-full md:w-4/12 flex justify-between items-center'>
          {/* Mobile Layout */}
          <div className='flex justify-between items-center w-full md:hidden'>
            <div className='w-1/3 flex justify-start items-center'>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </button>
            </div>
            <div className='w-1/3 flex justify-center items-center'>
              <Link to='/'>
                <img src={bidspaceLogo} alt='Bidspace Logo' className='max-w-[120px]' />
              </Link>
            </div>
            
            <div className='w-1/3 flex justify-end items-center'>
              {isAuthenticated ? (
                user?.roles?.includes('administrator') ? (
                  <AdminLoginButton user={user} />
                ) : (
                  <UserProfileDropdown user={user} />
                )
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="py-2 px-4 bg-black text-white rounded-full hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  შესვლა
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className='hidden md:block w-1/3'>
            <Link to='/'>
              <img src={bidspaceLogo} alt='Bidspace Logo' className='max-w-full' />
            </Link>
          </div>
          <div className='hidden md:block w-2/3'>
            <SearchInput />
          </div>
        </div>

        <div className='hidden md:flex w-8/12 justify-between items-center'>
          <nav className='w-1/2'>
            <ul className='flex gap-8 justify-center'>
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

          <div className='w-1/2 flex gap-4 justify-end items-center'>
            <button className='flex items-center py-2 px-4 gap-1.5 bg-white rounded-full hover:bg-gray-50 transition-colors'>
              <img className='w-6 h-6' src={languageIcon} alt='Language Icon' />
              <span className="font-medium">ქარ</span>
            </button>

            {isAuthenticated ? (
              user?.roles?.includes('administrator') ? (
                <AdminLoginButton user={user} />
              ) : (
                <UserProfileDropdown user={user} />
              )
            ) : (
              <button 
                onClick={onLoginClick}
                className="py-2 px-8 bg-black text-white rounded-full hover:bg-gray-900 transition-colors text-base font-medium"
              >
                შესვლა
              </button>
            )}
          </div>
        </div>
      </header>

      <MobileSidebar 
        isOpen={mobileMenuOpen}
        onLoginClick={onLoginClick}
        languageIcon={languageIcon}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;