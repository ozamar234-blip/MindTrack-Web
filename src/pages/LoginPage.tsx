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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--primary)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2.5rem',
          boxShadow: '0 12px 32px var(--primary-glow)',
          marginBottom: '20px'
        }}>🧠</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'black' }}>MindTrack</h1>
      </div>

      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '48px 32px',
        borderRadius: '40px',
        background: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>ברוכים הבאים</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '0.95rem', lineHeight: 1.5 }}>
          התחברו כדי להמשיך לעקוב אחר הבריאות הנפשית שלכם
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {error && (
            <div style={{
              background: '#FFF0F0', color: 'var(--emergency)', padding: '12px', borderRadius: '16px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center'
            }}>⚠️ {error}</div>
          )}

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>אימייל</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="email"
                placeholder="הזינו את כתובת האימייל"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
                style={{ padding: '16px 20px 16px 48px', borderRadius: '20px', border: '1px solid var(--border)', background: '#F9F9FC' }}
              />
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--primary)' }}>✉️</span>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>סיסמה</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="password"
                placeholder="הזינו את הסיסמה"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                dir="ltr"
                style={{ padding: '16px 20px 16px 48px', borderRadius: '20px', border: '1px solid var(--border)', background: '#F9F9FC' }}
              />
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--primary)' }}>🔒</span>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '32px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>שכחת סיסמה?</Link>
          </div>

          <button className="btn" type="submit" disabled={loading} style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '18px',
            borderRadius: '24px',
            fontSize: '1.1rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px var(--primary-glow)',
            width: '100%',
            marginBottom: '32px'
          }}>
            {loading ? '⏳ מתחבר...' : 'התחברות'}
          </button>
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          אין לך חשבון? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>הרשמה</Link>
        </p>
      </div>
    </div>
  );
}
