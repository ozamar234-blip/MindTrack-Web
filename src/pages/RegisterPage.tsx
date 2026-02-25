import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '../hooks/useAuth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading, error } = useSignUp();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      setLocalError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      setLocalError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    try {
      await signUp(email, password, fullName);
      navigate('/');
    } catch { /* error handled by hook */ }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">🧠</div>
      <h1 className="auth-title">הרשמה</h1>
      <p className="auth-subtitle">צור חשבון חדש ב-MindTrack</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {(error || localError) && <div className="auth-error">{localError || error}</div>}

        <div className="input-group">
          <label>שם מלא</label>
          <input className="input" type="text" placeholder="השם שלך" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>אימייל</label>
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
        </div>

        <div className="input-group">
          <label>סיסמה</label>
          <input className="input" type="password" placeholder="לפחות 6 תווים" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" />
        </div>

        <div className="input-group">
          <label>אימות סיסמה</label>
          <input className="input" type="password" placeholder="הזן שוב את הסיסמה" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required dir="ltr" />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'נרשם...' : 'הרשמה'}
        </button>
      </form>

      <p className="auth-link">
        כבר יש לך חשבון? <Link to="/login">התחברות</Link>
      </p>
    </div>
  );
}
