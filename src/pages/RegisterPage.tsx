import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '../hooks/useAuth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useSignUp();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Header Logo Group */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--secondary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(42, 25, 230, 0.2)'
        }}>🧠</div>
        <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>MindTrack</span>
      </div>

      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 24px',
        borderRadius: '40px',
        background: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: '16px',
          color: 'black'
        }}>התחילו את המסע שלכם</h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          marginBottom: '40px',
          lineHeight: 1.5,
          padding: '0 10px'
        }}>
          צרו חשבון כדי להתחיל לעקוב אחר השלווה הנפשית שלכם
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
          {(error || localError) && (
            <div style={{
              background: '#FFF0F0', color: 'var(--emergency)', padding: '12px', borderRadius: '16px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center'
            }}>⚠️ {localError || error}</div>
          )}

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#333', paddingRight: '4px' }}>שם מלא</label>
            <input
              className="input"
              type="text"
              placeholder="הזינו את שמכם המלא"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid var(--border)', background: '#F9F9FC', fontSize: '1rem' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#333', paddingRight: '4px' }}>אימייל</label>
            <input
              className="input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              dir="ltr"
              style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid var(--border)', background: '#F9F9FC', fontSize: '1rem' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#333', paddingRight: '4px' }}>צור סיסמה</label>
            <input
              className="input"
              type="password"
              placeholder="לפחות 8 תווים"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              dir="ltr"
              style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid var(--border)', background: '#F9F9FC', fontSize: '1rem' }}
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{
            background: 'var(--secondary)',
            color: 'white',
            padding: '20px',
            borderRadius: '24px',
            fontSize: '1.2rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(42, 25, 230, 0.2)',
            width: '100%',
            marginBottom: '32px'
          }}>
            {loading ? '⏳ מעבד...' : 'יצירת חשבון'}
          </button>
        </form>

        <div style={{
          borderTop: '1px solid #F0F0F0',
          paddingTop: '24px',
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          כבר יש לך חשבון? <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 700 }}>התחברות</Link>
        </div>
      </div>

      <div style={{ marginTop: '40px', fontSize: '0.75rem', color: '#B0B0C0', fontWeight: 700, letterSpacing: '1px' }}>
        MINDTRACK V1.0 PREMIUM
      </div>
    </div>
  );
}
