import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useSignIn();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch { /* error handled by hook */ }
  };

  return (
    <div className="auth-page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 32px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        <div className="auth-logo" style={{ fontSize: '4rem', marginBottom: '16px' }}>🧠</div>
        <h1 className="auth-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', letterSpacing: '-1px' }}>MindTrack</h1>
        <p className="auth-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px', fontWeight: 500 }}>המקום שלך למעקב בריאותי חכם ✨</p>

        <form className="auth-form" onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {error && <div className="auth-error" style={{
            background: '#FFF0F0',
            color: 'var(--emergency)',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: '1px solid rgba(255,107,107,0.2)'
          }}>⚠️ {error}</div>}

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📧 אימייל</label>
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              dir="ltr"
              style={{ borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', padding: '14px 18px' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>🔒 סיסמה</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              dir="ltr"
              style={{ borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', padding: '14px 18px' }}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{
            padding: '16px',
            fontSize: '1.1rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 20px var(--primary-glow)'
          }}>
            {loading ? '⏳ מתחבר...' : '🚀 התחברות'}
          </button>
        </form>

        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="auth-link" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            אין לך חשבון? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>צור חשבון חדש</Link>
          </p>
          <p className="auth-link">
            <Link to="/forgot-password" style={{ color: 'var(--text-light)', fontSize: '0.9rem', textDecoration: 'none' }}>שכחתי סיסמה</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
