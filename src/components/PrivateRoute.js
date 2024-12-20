import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  
  if (loading) {
    return null;
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to home')
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute