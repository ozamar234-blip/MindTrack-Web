import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, signOut } from '../api/auth';
import { DISCLAIMER_HE } from '../utils/constants';

const CONDITIONS = [
  { value: 'anxiety', label: '😰 חרדה' },
  { value: 'epilepsy', label: '⚡ אפילפסיה' },
  { value: 'migraine', label: '🤕 מיגרנה' },
  { value: 'digestive', label: '🫁 בעיות עיכול' },
  { value: 'other', label: '📋 אחר' },
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
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingTop: '8px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>הגדרות</h1>
        <div style={{ width: '44px' }}></div>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ padding: '32px', borderRadius: '40px', background: 'white', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>פרופיל אישי</h2>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 800, fontSize: '0.9rem', color: '#333' }}>שם תצוגה</label>
          <input
            className="input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="איך תרצה שנקרא לך?"
            style={{ padding: '18px 24px', borderRadius: '20px', border: '1px solid #EEE', background: '#F9F9FC' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '16px', fontWeight: 800, fontSize: '0.9rem', color: '#333' }}>מצב עיקרי למעקב</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {CONDITIONS.map(c => (
              <button
                key={c.value}
                onClick={() => setCondition(c.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: condition === c.value ? 'var(--secondary-light)' : '#F5F5F9',
                  color: condition === c.value ? 'var(--secondary)' : '#333',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  outline: condition === c.value ? '2px solid var(--secondary)' : 'none'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card" style={{ padding: '32px', borderRadius: '40px', background: 'white', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900 }}>סיכום שבועי</h2>
            <p style={{ color: '#8E8E93', fontSize: '0.85rem', marginTop: '4px' }}>קבל תובנות שבועיות למייל</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            style={{
              width: '56px',
              height: '32px',
              borderRadius: '16px',
              background: notifications ? 'var(--secondary)' : '#E0E0E0',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: notifications ? 'flex-end' : 'flex-start',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%' }} />
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        padding: '20px',
        fontSize: '1.2rem',
        borderRadius: '32px',
        background: 'var(--secondary)',
        color: 'white',
        fontWeight: 900,
        width: '100%',
        border: 'none',
        boxShadow: '0 12px 32px rgba(42, 25, 230, 0.3)',
        marginBottom: '48px',
        cursor: 'pointer'
      }}>
        {saving ? '⌛ שומר...' : saved ? '✅ השינויים נשמרו' : 'שמור הגדרות'}
      </button>

      {/* Danger Zone */}
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={handleSignOut}
          style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', color: '#8E8E93', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
        >
          התנתקות
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '32px',
        fontSize: '0.8rem',
        color: '#8E8E93',
        lineHeight: 1.6,
        textAlign: 'center'
      }}>
        {DISCLAIMER_HE}
      </div>
    </div>
  );
}
