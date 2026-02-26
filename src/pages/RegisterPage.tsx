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
        maxWidth: '450px',
        padding: '40px 32px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        <div className="auth-logo" style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌱</div>
        <h1 className="auth-title" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>הרשמה</h1>
        <p className="auth-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px' }}>בואו נתחיל את המסע הבריאותי שלך ✨</p>

        <form className="auth-form" onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {(error || localError) && <div className="auth-error" style={{
            background: '#FFF0F0', color: 'var(--emergency)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(255,107,107,0.2)'
          }}>⚠️ {localError || error}</div>}

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem' }}>👤 שם מלא</label>
            <input className="input" type="text" placeholder="השם שלך" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem' }}>📧 אימייל</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem' }}>🔒 סיסמה</label>
              <input className="input" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" style={{ borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem' }}>🔒 אימות</label>
              <input className="input" type="password" placeholder="••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required dir="ltr" style={{ borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '1.1rem' }}>
            {loading ? '⏳ נרשם...' : '✨ צור חשבון'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: '32px', color: 'var(--text-secondary)' }}>
          כבר יש לך חשבון? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>התחברות</Link>
        </p>
      </div>
    </div>
  );
}
