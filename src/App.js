import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import LoadingSpinner from './components/ui-elements/LoadingSpinner';
import Header from './components/layout/HeaderComponents/core/Header';
import LoginModal from './components/layout/HeaderComponents/auth/LoginModal';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ui-elements/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardRoutes from './pages/Dashboard/DashboardRoutes';
import AdminDashboardRoutes from './pages/AdminDashboard/AdminDashboardRoutes';
import { Toaster } from './components/ui/use-toast';
import NotFound from './components/core/NotFound';
import { AuthProvider } from './components/core/context/AuthContext';
import { AuctionProvider } from './components/core/context/AuctionContext';
import { WishlistProvider } from './components/core/context/WishlistContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';

// Lazy-loaded components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Forum = React.lazy(() => import('./pages/Forum'));
const InstructioPage = React.lazy(() => import('./pages/InstructionPage'));
const QuestionsPage = React.lazy(() => import('./pages/QuestionsPage'));
const AuctionArchivePage = React.lazy(() => import('./pages/AuctionArchive/AuctionArchivePage'));
const SingleAuction = React.lazy(() => import('./pages/SingleAuction'));
const AuctionSportPage = React.lazy(() => import('./pages/AuctionArchive/AuctionCategoryPage/AuctionSportPage'));
const AuctionTravelPage = React.lazy(() => import('./pages/AuctionArchive/AuctionCategoryPage/AuctionTravelPage'));
const AuctionEventPage = React.lazy(() => import('./pages/AuctionArchive/AuctionCategoryPage/AuctionEventPage'));
const AuctionTheaterCinemaPage = React.lazy(() => import('./pages/AuctionArchive/AuctionCategoryPage/AuctionTheaterCinemaPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

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
          <h2 className="text-xl font-bold text-red-600 mb-2">დაფიქסირდა შეცდომა</h2>
          <p className="text-gray-600">გთხოვთ, განაახლებთ გვერდი</p>
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuctionProvider>
            <WishlistProvider>
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
                      <Suspense fallback={<PageLoader />}>
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
                      </Suspense>
                    </main>
                  </CSSTransition>
                </TransitionGroup>
                {!isDashboardRoute && <Footer />}
                <LoginModal 
                  isOpen={showLoginModal} 
                  onClose={() => setShowLoginModal(false)} 
                />
              </div>
            </WishlistProvider>
          </AuctionProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
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