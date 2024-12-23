import React from 'react';
import { useNavigate } from 'react-router-dom';
import NoTFoundImage from '../../components/assets/images/404-page.webp';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[80vh] p-4">
      <img src={NoTFoundImage} className='w-64' alt="NoTFoundImage" />
      <h2 className="text-3xl font-semibold text-gray-800">გვერდი ვერ მოიძებნა!</h2>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-[#00a9ea] text-white rounded-lg font-medium rounded-full transition-colors"
      >
        მთავარ გვერდზე დაბრუნება
      </button>
    </div>
  );
};

export default NotFound;
