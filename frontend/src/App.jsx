import { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React Error Boundary Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '600px',
          margin: '40px auto',
          background: 'var(--color-surface, #fff)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          color: 'var(--color-text, #000)'
        }}>
          <h2 style={{ color: '#ef4444', margin: '0 0 12px', fontWeight: 900 }}>App Rendering Error</h2>
          <p style={{ color: 'var(--color-text-muted, #666)', fontSize: '0.9rem', marginBottom: 20 }}>
            An unexpected error occurred while rendering this page. Below are the details:
          </p>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            padding: '16px',
            borderRadius: '12px',
            overflowX: 'auto',
            color: '#b91c1c',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import HomePage from './pages/HomePage';
import MatchDashboard from './pages/MatchDashboard';
import ProfileViewPage from './pages/ProfileViewPage';
import ChatPage from './pages/ChatPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MeetHistoryPage from './pages/MeetHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import HelpPage from './pages/HelpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminPage from './pages/AdminPage';

// Layout
import Navbar from './components/layout/Navbar';
import EmailVerificationBanner from './components/ui/EmailVerificationBanner';

// Protected Route
const ProtectedRoute = ({ children, requireProfile = false, requireQuiz = false }) => {
  const { isAuthenticated, isProfileComplete, hasCompletedQuiz, loading, user } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireProfile && !isProfileComplete) return <Navigate to="/setup" replace />;
  if (requireQuiz && !hasCompletedQuiz && user?.role !== 'owner') return <Navigate to="/quiz" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const { sidebarExpanded } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {isAuthenticated && <EmailVerificationBanner />}
      {isAuthenticated && <Navbar />}
      <div 
        style={{
          flexGrow: 1,
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          paddingLeft: isAuthenticated ? (sidebarExpanded ? 240 : 78) : 0,
        }}
        className={isAuthenticated ? "pl-mobile-zero" : ""}
      >
        <Routes>
          {/* Public */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/privacy"           element={<PrivacyPolicyPage />} />
          <Route path="/terms"             element={<TermsPage />} />
          <Route path="/help"              element={<HelpPage />} />
          <Route path="/forgot-password"   element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password"    element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email"      element={<ProtectedRoute><VerifyEmailPage /></ProtectedRoute>} />

          {/* Protected - require auth */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute requireProfile><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz/result" element={<ProtectedRoute requireProfile><QuizResultPage /></ProtectedRoute>} />
          <Route path="/matches" element={
            <ProtectedRoute requireProfile requireQuiz>
              {user?.role === 'owner' ? <Navigate to="/listings" replace /> : <MatchDashboard />}
            </ProtectedRoute>
          } />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfileViewPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/listings/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><MeetHistoryPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .pl-mobile-zero {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                  },
                  success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
                }}
              />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
