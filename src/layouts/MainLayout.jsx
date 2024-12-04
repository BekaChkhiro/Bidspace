import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/HeaderComponents/Header'
import Footer from '../components/Footer'
import LoginModal from '../components/HeaderComponents/LoginModal'

const MainLayout = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  console.log('MainLayout რენდერდება');

  return (
    <div className="flex flex-col min-h-screen">
      <Header onLoginClick={() => setShowLoginModal(true)} />
      <main className="flex-grow bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}

export default MainLayout