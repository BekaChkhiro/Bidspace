import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import LoadingSpinner from './components/ui-elements/LoadingSpinner';
import Header from './components/layout/HeaderComponents/core/Header';
import LoginModal from './components/layout/HeaderComponents/auth/LoginModal';
import HomePage from './pages/HomePage';
import InstructioPage from './pages/InstructionPage';
import QuestionsPage from './pages/QuestionsPage';
import Footer from './components/layout/Footer';
import { AuctionProvider } from './components/core/context/AuctionContext';
import AuctionArchivePage from './pages/AuctionArchive/AuctionArchivePage';
import SingleAuction from './pages/SingleAuction';
import AuctionSportPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionSportPage';
import AuctionTravelPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionTravelPage';
import AuctionEventPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionEventPage';
import AuctionTheaterCinemaPage from './pages/AuctionArchive/AuctionCategoryPage/AuctionTheaterCinemaPage';
import ScrollToTop from './components/ui-elements/ScrollToTop';
import { AuthProvider } from './components/core/context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardRoutes from './pages/Dashboard/DashboardRoutes';
import AdminDashboardRoutes from './pages/AdminDashboard/AdminDashboardRoutes';
import { Toaster } from './components/ui/use-toast';
import NotFound from './components/core/NotFound';
import Forum from './pages/Forum';
import ForumRules from './pages/Forum/ForumRules';
import ForumCinema from './pages/Forum/ForumCinema';
import ForumEvents from './pages/Forum/ForumEvents';
import ForumSports from './pages/Forum/ForumSports';
import ForumTravel from './pages/Forum/ForumTravel';
import MyQuestions from './pages/Forum/MyQuestions';
import MyResponses from './pages/Forum/MyResponses';
import MyLikes from './pages/Forum/MyLikes';
import { initializeMessaging, setupMessageListener } from './lib/messagingUtils';

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

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isForumRoute = location.pathname.startsWith('/forum');

  React.useEffect(() => {
    if (!isDashboardRoute && !isForumRoute) {
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  }, [isDashboardRoute, isForumRoute]);

  React.useEffect(() => {
    if (isDashboardRoute) {
      document.body.style.paddingTop = '0';
      document.getElementById('wpadminbar')?.style.setProperty('display', 'none');
    } else {
      document.body.style.paddingTop = '';
      document.getElementById('wpadminbar')?.style.setProperty('display', '');
    }
  }, [isDashboardRoute]);

  React.useEffect(() => {
    // Initialize Firebase Cloud Messaging
    const initializeFCM = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered:', registration);

          // Initialize messaging
          const messagingInitialized = await initializeMessaging();
          if (messagingInitialized) {
            // Setup message listener for foreground messages
            setupMessageListener();
          }
        } catch (error) {
          console.error('Error initializing messaging:', error);
        }
      }
    };

    initializeFCM();
  }, []);

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
                    <Route path="/forum/*" element={<Forum />} />
                    <Route path="/instruction" element={<InstructioPage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/auction" element={<AuctionArchivePage />} />
                    <Route path="/auction/:id" element={<SingleAuction />} />
                    <Route path="/sport" element={<AuctionSportPage />} />
                    <Route path="/travel" element={<AuctionTravelPage />} />
                    <Route path="/events" element={<AuctionEventPage />} />
                    <Route path="/theater_cinema" element={<AuctionTheaterCinemaPage />} />
                    <Route path="/dashboard/*" element={<DashboardRoutes />} />
                    <Route path="/admin/*" element={<AdminDashboardRoutes />} />
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