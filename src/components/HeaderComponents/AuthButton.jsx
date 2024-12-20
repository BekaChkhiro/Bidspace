import React, { useState } from 'react';
import LoginModal from './LoginModal';

const AuthButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="py-2 px-8 bg-black text-white rounded-full hover:bg-gray-900 transition-colors text-base font-medium"
      >
        შესვლა
      </button>
      
      <LoginModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default AuthButton;