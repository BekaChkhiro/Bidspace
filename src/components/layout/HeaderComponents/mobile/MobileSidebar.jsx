import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from '../search/SearchInput';
import { useAuth } from '../../../core/context/AuthContext';
import UserProfileDropdown from '../user/UserProfileDropdown';
import { HiX } from 'react-icons/hi';
import SidbarArrow from '../../../assets/icons/header/sidebar_arrow.svg';

const MobileSidebar = ({ isOpen, onLoginClick, languageIcon, onClose }) => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
          <div className="fixed inset-0 bg-white z-50 md:hidden animate-slide-left">
            <div className='p-4 flex flex-col h-full overflow-y-auto'>
          <div className='flex flex-col items-end pb-4 mb-6 border-b'>
            <button 
              onClick={onClose}
              className='hover:bg-gray-100 rounded-full transition-colors'
            >
              <HiX size={24} className="text-gray-600" />
            </button>
          </div>

          <div className='w-full mb-12'>
            <SearchInput variant="sidebar" />
          </div>
          
          <nav className='w-full mb-auto'>
            <ul className='flex flex-col gap-7'>
              <li>
                <Link 
                  to='/'
                  onClick={onClose}
                  className='px-2 pb-3 flex justify-between items-center border-b'
                >
                  <span>მთავარი</span>
                  <img src={SidbarArrow} className="w-6 h-6" alt="arrow" />
                </Link>
              </li>

              <li>
                <Link 
                  to='/auction'
                  onClick={onClose}
                  className='px-2 pb-3 flex justify-between items-center border-b'
                >
                  <span>აუქციონები</span>
                  <img src={SidbarArrow} className="w-6 h-6" alt="arrow" />
                </Link>
              </li>

              <li>
                <Link 
                  to='/forum'
                  onClick={onClose}
                  className='px-2 pb-3 flex justify-between items-center border-b'
                >
                  <span>ფორუმი</span>
                  <img src={SidbarArrow} className="w-6 h-6" alt="arrow" />
                </Link>
              </li>

              <li>
                <Link 
                  to='/questions'
                  onClick={onClose}
                  className='px-2 pb-3 flex justify-between items-center border-b'
                >
                  <span>შეკითხვები</span>
                  <img src={SidbarArrow} className="w-6 h-6" alt="arrow" />
                </Link>
              </li>

              <li>
                <Link 
                  to='/instruction'
                  onClick={onClose}
                  className='px-2 pb-3 flex justify-between items-center border-b'
                >
                  <span>ინსტრუქცია</span>
                  <img src={SidbarArrow} className="w-6 h-6" alt="arrow" />
                </Link>
              </li>
            </ul>
          </nav>

          <div className='flex flex-col gap-4 mt-8 border-t pt-8'>
            <button className='flex items-center justify-center py-3 px-4 gap-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border'>
          <img className='w-5 h-5' src={languageIcon} alt='Language Icon' />
          <span className="font-medium">ქარ</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
