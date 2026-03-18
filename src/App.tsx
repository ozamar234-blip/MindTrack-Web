import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Eagerly loaded pages (auth + shell)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';

// Lazily loaded pages (code splitting)
const EventLogPage = lazy(() => import('./pages/EventLogPage'));
const CheckinPage = lazy(() => import('./pages/CheckinPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BreathingPage = lazy(() => import('./pages/BreathingPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Styles
import './styles/global.css';

function PageLoader() {
  return (
    <div className="loading-page">
      <div>
        <div className="spinner" />
        <p style={{ textAlign: 'center', color: '#636E72', marginTop: 8 }}>טוען...</p>
      </div>
    </div>
  );
}

const navItems = [
  { path: '/', label: 'בית', icon: 'home' },
  { path: '/history', label: 'יומן', icon: 'menu_book' },
  { path: '/breathing', label: 'תרגול', icon: 'favorite' },
  { path: '/settings', label: 'הגדרות', icon: 'settings' },
];

function BottomNav() {
  const location = useLocation();
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/event-log', '/breathing', '/checkin'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="floating-nav">
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={isActive ? 'active' : ''}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: isActive ? 'var(--primary)' : 'var(--text-light)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                padding: '8px 0',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '3px',
                  background: 'var(--primary)',
                  borderRadius: '2px',
                }} />
              )}
              <span
                className={`material-symbols-outlined${isActive ? ' fill-1' : ''}`}
                style={{ fontSize: '24px' }}
              >
                {item.icon}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div>
          <div className="spinner" />
          <p style={{ textAlign: 'center', color: '#636E72', marginTop: 8 }}>MindTrack 🧠</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/event-log" element={<ProtectedRoute><EventLogPage /></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><CheckinPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/breathing" element={<ProtectedRoute><BreathingPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
