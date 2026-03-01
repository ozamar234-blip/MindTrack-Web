import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import EventLogPage from './pages/EventLogPage';
import CheckinPage from './pages/CheckinPage';
import DashboardPage from './pages/DashboardPage';
import BreathingPage from './pages/BreathingPage';
import InsightsPage from './pages/InsightsPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/global.css';

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
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      padding: '12px 24px 24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? 'var(--primary)' : 'var(--text-light)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
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
    return (
      <div className="loading-page">
        <div>
          <div className="spinner" />
          <p style={{ textAlign: 'center', color: '#636E72', marginTop: 8 }}>טוען...</p>
        </div>
      </div>
    );
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
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
