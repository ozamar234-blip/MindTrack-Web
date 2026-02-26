import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, signOut } from '../api/auth';
import { supabase } from '../api/supabase';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDeleteAllData = async () => {
    if (!user) return;
    try {
      await supabase.from('ai_insights').delete().eq('user_id', user.id);
      await supabase.from('breathing_sessions').delete().eq('user_id', user.id);
      await supabase.from('daily_checkins').delete().eq('user_id', user.id);
      await supabase.from('events').delete().eq('user_id', user.id);
      setShowDeleteConfirm(false);
      alert('כל הנתונים נמחקו ✅');
    } catch {
      alert('שגיאה במחיקה');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="page" style={{ paddingBottom: '120px' }}>
      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>⚙️ הגדרות</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>נהל את החשבון וההעדפות שלך</p>
      </div>

      {/* Profile Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
        <div className="card-header" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>👤 פרופיל אישי</div>

        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>שם תצוגה</label>
          <input
            className="input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="השם שלך"
            style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }}
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, fontSize: '0.9rem' }}>מצב עיקרי למעקב</label>
          <div className="chips-container" style={{ gap: '10px' }}>
            {CONDITIONS.map(c => (
              <button
                key={c.value}
                className={`chip ${condition === c.value ? 'selected' : ''}`}
                onClick={() => setCondition(c.value)}
                style={{ padding: '12px 18px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div className="setting-label" style={{ fontSize: '1.1rem', fontWeight: 800 }}>🔔 התראות ועדכונים</div>
            <div className="setting-description" style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '4px' }}>קבל תזכורות לביצוע צ׳ק-אין יומי</div>
          </div>
          <button
            className={`toggle ${notifications ? 'active' : ''}`}
            onClick={() => setNotifications(!notifications)}
            style={{ width: '60px', height: '32px', borderRadius: '20px', background: notifications ? 'var(--primary)' : 'var(--border)' }}
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{
        padding: '18px',
        fontSize: '1.1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '40px',
        boxShadow: '0 8px 20px var(--primary-glow)'
      }}>
        {saving ? '⏳ שומר...' : saved ? '✅ נשמר בהצלחה!' : '💾 שמור שינויים'}
      </button>

      {/* Danger Zone Section */}
      <div className="card" style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,107,107,0.03)',
        border: '1px solid rgba(255,107,107,0.2)',
        marginBottom: '32px'
      }}>
        <div className="card-header" style={{ color: 'var(--emergency)', fontWeight: 900, marginBottom: '16px' }}>⚠️ אמצעי זהירות</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(true)} style={{ color: 'var(--emergency)', borderColor: 'var(--emergency)', padding: '14px' }}>
            🗑️ מחק את כל היסטוריית הנתונים
          </button>
          <button className="btn btn-ghost" onClick={handleSignOut} style={{ color: 'var(--text-light)', fontWeight: 700 }}>
            🚪 התנתקות מהמערכת
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-warm)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
        border: '1px solid var(--border)',
        textAlign: 'right'
      }}>
        <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>שים לב:</strong>
        {DISCLAIMER_HE}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>
        MindTrack v1.5 • נבנה באהבה עבור המסע שלך 💜
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="overlay" onClick={() => setShowDeleteConfirm(false)} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div className="dialog-title" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--emergency)' }}>⚠️ מחיקת כל הנתונים</div>
            <div className="dialog-text" style={{ margin: '16px 0 32px', fontSize: '1.05rem', lineHeight: 1.6 }}>פעולה זו תמחק לצמיתות את כל האירועים, הצ׳ק-אינים, התובנות ומפגשי הנשימה שלך. פעולה זו אינה הפיכה.</div>
            <div className="dialog-actions" style={{ gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '14px' }} onClick={() => setShowDeleteConfirm(false)}>ביטול</button>
              <button className="btn btn-emergency" style={{ flex: 1, padding: '14px' }} onClick={handleDeleteAllData}>🗑️ מחק הכל</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
