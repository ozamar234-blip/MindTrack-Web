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
      <div className="auth-page">
        <div className="auth-logo">📧</div>
        <h1 className="auth-title">נשלח!</h1>
        <p className="auth-subtitle">בדוק את תיבת המייל שלך לקישור לאיפוס סיסמה</p>
        <Link to="/login" className="btn btn-primary" style={{ maxWidth: 300, textDecoration: 'none', marginTop: 24 }}>
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🔑</div>
      <h1 className="auth-title">שכחתי סיסמה</h1>
      <p className="auth-subtitle">נשלח לך קישור לאיפוס</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <label>אימייל</label>
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'שולח...' : 'שלח קישור'}
        </button>
      </form>

      <p className="auth-link">
        <Link to="/login">חזרה להתחברות</Link>
      </p>
    </div>
  );
}
