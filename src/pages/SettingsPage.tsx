import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateProfile, signOut } from '../api/auth';
import { DISCLAIMER_HE } from '../utils/constants';

const CONDITIONS = [
  { value: 'anxiety', label: 'חרדה', icon: 'psychology_alt' },
  { value: 'epilepsy', label: 'אפילפסיה', icon: 'bolt' },
  { value: 'migraine', label: 'מיגרנה', icon: 'headphones' },
  { value: 'digestive', label: 'עיכול', icon: 'gastroenterology' },
  { value: 'other', label: 'אחר', icon: 'add' },
];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [condition, setCondition] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setCondition(profile.primary_condition || '');
      setNotifications(profile.notifications_enabled);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(user.id, {
        display_name: displayName,
        primary_condition: condition,
        notifications_enabled: notifications,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      flexDirection: 'column',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      overflow: 'hidden',
      paddingBottom: '96px',
      background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f6f6f8 100%)',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>settings</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>הגדרות</h1>
        </div>
      </motion.div>

      <div style={{ padding: '0 24px' }}>
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>person</span>
            פרופיל אישי
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>שם תצוגה</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="איך תרצה שנקרא לך?"
              className="glass"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>מצב עיקרי למעקב</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CONDITIONS.map(c => {
                const isSelected = condition === c.value;
                return (
                  <motion.button
                    key={c.value}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setCondition(c.value)}
                    className="glass"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid var(--primary)' : undefined,
                      background: isSelected ? 'rgba(42,25,230,0.08)' : undefined,
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{c.icon}</span>
                    {c.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>notifications</span>
                סיכום שבועי
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>קבל תובנות שבועיות למייל</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifications(!notifications)}
              style={{
                width: '52px',
                height: '30px',
                borderRadius: '15px',
                background: notifications ? 'var(--primary)' : '#e2e8f0',
                border: 'none',
                padding: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: notifications ? 'flex-end' : 'flex-start',
                transition: 'background 0.3s',
              }}
            >
              <motion.div
                layout
                style={{
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.05rem',
            borderRadius: '16px',
            background: saved ? '#10b981' : 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            border: 'none',
            boxShadow: saved ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(42, 25, 230, 0.3)',
            marginBottom: '32px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.3s, box-shadow 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {saving ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderTopColor: 'white' }} />
              שומר...
            </>
          ) : saved ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              השינויים נשמרו
            </>
          ) : 'שמור הגדרות'}
        </motion.button>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          התנתקות
        </motion.button>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '32px',
            padding: '20px',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '16px',
            fontSize: '0.75rem',
            color: 'var(--text-light)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          {DISCLAIMER_HE}
        </motion.div>
      </div>
    </div>
  );
}
