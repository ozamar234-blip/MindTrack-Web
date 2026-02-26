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
      <div className="auth-page" style={{ background: 'var(--bg-warm)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '48px 32px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div className="auth-logo" style={{ fontSize: '4.5rem', marginBottom: '20px' }}>✉️</div>
          <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>נשלח בהצלחה!</h1>
          <p className="auth-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>בדוק את תיבת המייל שלך לקישור לאיפוס סיסמה 📬</p>
          <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '16px' }}>
            ← חזרה להתחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ background: 'var(--bg-warm)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <div className="auth-logo" style={{ fontSize: '4rem', marginBottom: '16px' }}>🔑</div>
        <h1 className="auth-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>שכחתי סיסמה</h1>
        <p className="auth-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>נשלח לך קישור לאיפוס 💌</p>

        <form className="auth-form" onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {error && <div className="auth-error" style={{ background: '#FFF0F0', color: 'var(--emergency)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem' }}>⚠️ {error}</div>}
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>📧 אימייל</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            {loading ? '⏳ שולח...' : '📨 שלח קישור'}
          </button>
        </form>

        <div style={{ marginTop: '32px' }}>
          <Link to="/login" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '0.9rem' }}>← חזרה להתחברות</Link>
        </div>
      </div>
    </div>
  );
}
