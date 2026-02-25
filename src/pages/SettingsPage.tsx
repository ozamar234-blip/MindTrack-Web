import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, signOut } from '../api/auth';
import { supabase } from '../api/supabase';
import { DISCLAIMER_HE } from '../utils/constants';

const CONDITIONS = [
  { value: 'anxiety', label: 'חרדה' },
  { value: 'epilepsy', label: 'אפילפסיה' },
  { value: 'migraine', label: 'מיגרנה' },
  { value: 'digestive', label: 'בעיות עיכול' },
  { value: 'other', label: 'אחר' },
];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [condition, setCondition] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    try {
      await updateProfile(user.id, {
        display_name: displayName,
        primary_condition: condition,
        notifications_enabled: notifications,
      });
      await refreshProfile();
      alert('ההגדרות נשמרו בהצלחה ✅');
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
      alert('כל הנתונים נמחקו');
    } catch {
      alert('שגיאה במחיקה');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">הגדרות ⚙️</h1>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="card-header">פרופיל</div>
        <div className="input-group">
          <label>שם תצוגה</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="השם שלך" />
        </div>

        <div className="input-group">
          <label>מצב עיקרי</label>
          <div className="chips-container">
            {CONDITIONS.map(c => (
              <button key={c.value} className={`chip ${condition === c.value ? 'selected' : ''}`} onClick={() => setCondition(c.value)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="setting-row" style={{ borderBottom: 'none' }}>
          <div>
            <div className="setting-label">התראות</div>
            <div className="setting-description">קבל תזכורות יומיות</div>
          </div>
          <button className={`toggle ${notifications ? 'active' : ''}`} onClick={() => setNotifications(!notifications)} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: 12 }}>
        {saving ? 'שומר...' : '💾 שמור הגדרות'}
      </button>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: '#FF6B6B', borderWidth: 1, borderStyle: 'solid', marginTop: 24 }}>
        <div className="card-header" style={{ color: '#FF6B6B' }}>אזור מסוכן</div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowDeleteConfirm(true)} style={{ marginBottom: 8, borderColor: '#FF6B6B', color: '#FF6B6B' }}>
          🗑️ מחק את כל הנתונים שלי
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut} style={{ color: '#636E72' }}>
          🚪 התנתקות
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: 16, background: '#FFF8E1', borderRadius: 10, fontSize: '0.8rem', color: '#636E72', lineHeight: 1.6 }}>
        ⚠️ {DISCLAIMER_HE}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#B2BEC3' }}>
        MindTrack v1.0.0
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-title">⚠️ מחיקת כל הנתונים</div>
            <div className="dialog-text">פעולה זו תמחק את כל האירועים, הצ׳ק-אינים, התובנות ומפגשי הנשימה שלך. לא ניתן לשחזר.</div>
            <div className="dialog-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setShowDeleteConfirm(false)}>ביטול</button>
              <button className="btn btn-emergency btn-sm" onClick={handleDeleteAllData}>מחק הכל</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
