import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home, BarChart3, Brain, Clock, Settings } from 'lucide-react';

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
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/global.css';

function BottomNav() {
  const location = useLocation();
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/event-log', '/breathing', '/checkin'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      height: '76px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 12px',
      zIndex: 1000,
      border: '1px solid rgba(255,255,255,0.5)'
    }}>
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: location.pathname === '/' ? 'var(--primary)' : '#8E8E93',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        transform: location.pathname === '/' ? 'scale(1.1)' : 'scale(1)'
      }}>
        <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>בית</span>
      </NavLink>
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: location.pathname === '/dashboard' ? 'var(--primary)' : '#8E8E93',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        transform: location.pathname === '/dashboard' ? 'scale(1.1)' : 'scale(1)'
      }}>
        <BarChart3 size={22} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>דשבורד</span>
      </NavLink>
      <NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: location.pathname === '/insights' ? 'var(--primary)' : '#8E8E93',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        transform: location.pathname === '/insights' ? 'scale(1.1)' : 'scale(1)'
      }}>
        <Brain size={22} strokeWidth={location.pathname === '/insights' ? 2.5 : 2} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>תובנות</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: location.pathname === '/history' ? 'var(--primary)' : '#8E8E93',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        transform: location.pathname === '/history' ? 'scale(1.1)' : 'scale(1)'
      }}>
        <Clock size={22} strokeWidth={location.pathname === '/history' ? 2.5 : 2} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>היסטוריה</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        color: location.pathname === '/settings' ? 'var(--primary)' : '#8E8E93',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        transform: location.pathname === '/settings' ? 'scale(1.1)' : 'scale(1)'
      }}>
        <Settings size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>הגדרות</span>
      </NavLink>
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
