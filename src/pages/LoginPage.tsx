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
    <div className="auth-page">
      <div className="auth-logo">🧠</div>
      <h1 className="auth-title">MindTrack</h1>
      <p className="auth-subtitle">מעקב בריאותי חכם</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="input-group">
          <label>אימייל</label>
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
        </div>

        <div className="input-group">
          <label>סיסמה</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'מתחבר...' : 'התחברות'}
        </button>
      </form>

      <p className="auth-link">
        אין לך חשבון? <Link to="/register">הרשמה</Link>
      </p>
      <p className="auth-link">
        <Link to="/forgot-password">שכחתי סיסמה</Link>
      </p>
    </div>
  );
}
