import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function LoginModalHandler({ setShowLoginModal }) {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLoginModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location, setShowLoginModal]);

  return null;
} 