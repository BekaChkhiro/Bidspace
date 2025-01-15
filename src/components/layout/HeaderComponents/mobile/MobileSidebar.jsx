import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from '../search/SearchInput';
import { useAuth } from '../../../core/context/AuthContext';
import UserProfileDropdown from '../user/UserProfileDropdown';
import { HiX } from 'react-icons/hi';

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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 md:hidden overflow-hidden"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-[85%] max-w-[400px] bg-white z-50 md:hidden shadow-xl animate-slide-left overflow-hidden">
        <div className='px-6 py-8 flex flex-col h-full overflow-y-auto'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className="text-xl font-bold text-gray-900">მენიუ</h2>
            <button 
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <HiX size={24} className="text-gray-600" />
            </button>
          </div>

          <div className='w-full mb-8'>
            <SearchInput />
          </div>
          
          <nav className='w-full mb-auto'>
            <ul className='flex flex-col gap-7'>
              {['ფორუმი', 'შეკითხვები', 'ინსტრუქცია'].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className='text-gray-800 text-lg font-medium hover:text-[#00adef] transition-colors flex items-center gap-3'
                    onClick={onClose}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className='flex flex-col gap-4 mt-8 border-t pt-8'>
            <button className='flex items-center justify-center py-3 px-4 gap-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border'>
              <img className='w-5 h-5' src={languageIcon} alt='Language Icon' />
              <span className="font-medium">ქარ</span>
            </button>

            {isAuthenticated ? (
              <UserProfileDropdown user={user} />
            ) : (
              <button 
                onClick={() => {
                  onLoginClick();
                  onClose();
                }}
                className="w-full py-3 px-8 bg-black text-white rounded-full hover:bg-gray-900 transition-colors text-base font-semibold shadow-sm"
              >
                შესვლა
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
