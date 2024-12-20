import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/HeaderComponents/Header';
import LoginModal from './components/HeaderComponents/LoginModal';
import HomePage from './pages/HomePage';
import InstructioPage from './pages/InstructionPage';
import QuestionsPage from './pages/QuestionsPage';
import Footer from './components/Footer';
import { AuctionProvider } from './context/AuctionContext';
import AuctionArchivePage from './pages/AuctionArchive/AuctionArchivePage';
import SingleAuction from './pages/SingleAuction';
import AuctionSportPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionSportPage';
import AuctionTravelPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionTravelPage';
import AuctionEventPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionEventPage';
import AuctionTheaterCinemaPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionTheaterCinemaPage';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRoutes from './pages/Dashboard/DashboardRoutes';
import { Toaster } from './components/ui/use-toast';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-10 bg-red-50 mx-4 my-4 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">დაფიქსირდა შეცდომა</h2>
          <p className="text-gray-600">გთხოვთ, განაახლოთ გვერდი</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            გვერდის განახლება
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold mb-4">404 - გვერდი ვერ მოიძებნა</h2>
      <p>სამწუხაროდ, თქვენს მიერ მოთხოვნილი გვერდი ვერ მოიძებნა.</p>
    </div>
  );
}

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  React.useEffect(() => {
    if (!isDashboardRoute) {
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  }, [isDashboardRoute]);

  React.useEffect(() => {
    if (isDashboardRoute) {
      document.body.style.paddingTop = '0';
      document.getElementById('wpadminbar')?.style.setProperty('display', 'none');
    } else {
      document.body.style.paddingTop = '';
      document.getElementById('wpadminbar')?.style.setProperty('display', '');
    }
  }, [isDashboardRoute]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuctionProvider>
          <div className="flex flex-col min-h-screen">
            <Toaster />
            {!isDashboardRoute && <Header onLoginClick={() => setShowLoginModal(true)} />}
            <TransitionGroup component={null}>
              <CSSTransition
                key={location.key}
                timeout={300}
                classNames="page-transition"
                unmountOnExit
              >
                <main className="flex-grow">
                  <ScrollToTop />
                  <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/instruction" element={<InstructioPage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/auction" element={<AuctionArchivePage />} />
                    <Route path="/auction/:id" element={<SingleAuction />} />
                    <Route path="/sport" element={<AuctionSportPage />} />
                    <Route path="/travel" element={<AuctionTravelPage />} />
                    <Route path="/events" element={<AuctionEventPage />} />
                    <Route path="/theater_cinema" element={<AuctionTheaterCinemaPage />} />
                    <Route path="/dashboard/*" element={<DashboardRoutes />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </CSSTransition>
            </TransitionGroup>
            {!isDashboardRoute && <Footer />}
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
            />
          </div>
        </AuctionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// შევქმნათ ცალკე კომპონენტი Router-ისთვის
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;