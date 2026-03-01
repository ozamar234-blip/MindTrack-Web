import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSignUp } from '../hooks/useAuth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '430px',
      minHeight: '100vh',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 40%, #fae8ff 100%)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <motion.div
          whileTap={{ scale: 0.85 }}
          style={{
            padding: '8px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
          }}
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' as const, stiffness: 300, damping: 20 }}
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>psychology</span>
          </motion.div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.3px' }}>MindTrack</span>
        </div>
        <div style={{ width: '40px' }} />
      </motion.div>

      {/* Form Card */}
      <div style={{
        flex: 1,
        padding: '0 24px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring' as const, stiffness: 200, damping: 25 }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '8px',
            }}>התחילו את המסע שלכם</h1>
            <p style={{
              color: 'var(--text-secondary)',
            }}>צרו חשבון כדי להתחיל לעקוב אחר השלווה הנפשית שלכם</p>
          </motion.div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  border: '1px solid rgba(220,38,38,0.1)',
                }}
              >
                {localError || error}
              </motion.div>
            )}

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginRight: '4px',
              }}>שם מלא</label>
              <input
                type="text"
                placeholder="הזינו את שמכם המלא"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '56px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '0 16px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(42,25,230,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginRight: '4px',
              }}>אימייל</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
                style={{
                  width: '100%',
                  height: '56px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '0 16px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(42,25,230,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <label style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginRight: '4px',
              }}>צור סיסמה</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="לפחות 6 תווים"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  style={{
                    width: '100%',
                    height: '56px',
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '0 48px 0 16px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(42,25,230,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    transition: 'color 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.125rem',
                borderRadius: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
                transition: 'opacity 0.2s ease',
                fontFamily: 'inherit',
                marginTop: '8px',
              }}
            >
              {loading ? 'מעבד...' : 'יצירת חשבון'}
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{
              marginTop: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(226,232,240,0.5)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>כבר יש לך חשבון?</p>
            <Link to="/login" style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}>התחברות</Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Background Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: '-80px',
          right: '-80px',
          width: '256px',
          height: '256px',
          background: 'rgba(42,25,230,0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '256px',
          height: '256px',
          background: 'rgba(168,85,247,0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.6 }}
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <div style={{
          width: '128px',
          height: '4px',
          background: '#cbd5e1',
          borderRadius: '9999px',
          marginBottom: '8px',
        }} />
        <p style={{
          fontSize: '10px',
          color: 'var(--text-light)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>MindTrack v1.0 Premium</p>
      </motion.div>
    </div>
  );
}
