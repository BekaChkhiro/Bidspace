import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // ყოველ რენდერზე ვამოწმებთ ავტორიზაციის სტატუსს
    checkAuthStatus()
  }, [location.pathname])

  // თუ ჯერ კიდევ მოწმდება ავტორიზაციის სტატუსი, არაფერი არ ჩატვირთოს
  if (loading) {
    return null;
  }

  // თუ არ არის ავტორიზებული, გადავამისამართოთ მთავარ გვერდზე
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to home')
    return <Navigate to="/" state={{ showLogin: true }} replace />
  }

  console.log('Authenticated, showing protected content')
  return children
}

export default ProtectedRoute