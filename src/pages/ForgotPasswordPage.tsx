import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('שגיאה בשליחת המייל');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page" style={{
        background: 'var(--bg-main)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '60px 40px',
          borderRadius: '44px',
          background: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '24px' }}>✉️</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>נשלח בהצלחה!</h1>
          <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1rem', fontWeight: 700 }}>בדוק את תיבת המייל שלך לקישור לאיפוס סיסמה 📬</p>
          <Link to="/login" className="btn" style={{
            textDecoration: 'none',
            padding: '20px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '32px',
            fontWeight: 900,
            display: 'block',
            boxShadow: '0 12px 32px rgba(127, 19, 236, 0.3)'
          }}>
            חזרה להתחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{
      background: 'var(--bg-main)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '60px 40px',
        borderRadius: '44px',
        background: 'white',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔑</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>שכחתי סיסמה</h1>
        <p style={{ color: '#666', marginBottom: '48px', fontSize: '1rem', fontWeight: 700 }}>נשלח לך קישור לאיפוס 💌</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {error && <div style={{ background: '#FFF0F0', color: 'red', padding: '16px', borderRadius: '20px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 700 }}>⚠️ {error}</div>}

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 800, fontSize: '0.9rem', color: '#1A1A1A' }}>אימייל</label>
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              dir="ltr"
              style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid #EEE', background: '#F9F9FC' }}
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{
            padding: '20px',
            borderRadius: '32px',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 900,
            width: '100%',
            fontSize: '1.1rem',
            boxShadow: '0 12px 32px rgba(127, 19, 236, 0.3)'
          }}>
            {loading ? 'שולח...' : 'שלח קישור'}
          </button>
        </form>

        <div style={{ marginTop: '40px' }}>
          <Link to="/login" style={{ color: '#8E8E93', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>חזרה להתחברות</Link>
        </div>
      </div>
    </div>
  );
}
