import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCheckins } from '../hooks/useCheckins';
import { MOOD_EMOJIS, ACTIVITY_OPTIONS } from '../utils/constants';

export default function CheckinPage() {
  const { user } = useAuth();
  const { createCheckin } = useCheckins(user?.id);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const checkinType = hour < 14 ? 'morning' : 'evening';

  const [mood, setMood] = useState(3);
  const [energy] = useState(3);
  const [sleepQuality] = useState(3);
  const [sleepHours] = useState(7);
  const [stress] = useState(3);
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createCheckin({
        checkin_type: checkinType,
        mood,
        energy_level: energy,
        sleep_quality: sleepQuality,
        sleep_hours: sleepHours,
        stress_level: stress,
        physical_activity: activity,
        notes,
      });
      navigate('/');
    } catch {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Navigation Header */}
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
          <span style={{ fontSize: '1.2rem' }}>📅</span>
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>MindTrack</span>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>✕</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px' }}>איך ההרגשה שלך?</h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>קח רגע לעצמך ובדוק איך אתה מרגיש עכשיו</p>
      </div>

      {/* Mood Selector (Horizontal Circles) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '48px',
        padding: '0 8px'
      }}>
        {MOOD_EMOJIS.map(m => (
          <div key={m.value} style={{ textAlign: 'center' }}>
            <button
              onClick={() => setMood(m.value)}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: mood === m.value ? '2px solid var(--secondary)' : '1px solid #EEE',
                background: mood === m.value ? 'white' : '#F9F9FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.3s ease',
                boxShadow: mood === m.value ? '0 8px 20px rgba(42, 25, 230, 0.15)' : 'none'
              }}
            >
              {m.emoji}
            </button>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: mood === m.value ? 'var(--secondary)' : '#666'
            }}>{m.label}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>מה השפיע על מצב הרוח שלך היום?</h2>

      {/* Activity Chips (Pills) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '48px'
      }}>
        {ACTIVITY_OPTIONS.map(a => (
          <button
            key={a.value}
            onClick={() => setActivity(a.value)}
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              border: 'none',
              background: activity === a.value ? 'var(--secondary-light)' : '#F5F5F9',
              color: activity === a.value ? 'var(--secondary)' : '#333',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: activity === a.value ? '2px solid var(--secondary)' : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
        <button style={{
          padding: '12px 24px',
          borderRadius: '24px',
          border: 'none',
          background: '#F5F5F9',
          color: '#333',
          fontSize: '0.95rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: '1.2rem' }}>+</span>
          אחר
        </button>
      </div>

      {/* Notes Section */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px', textAlign: 'center' }}>הערות נוספות (אופציונלי)</h3>
        <textarea
          className="input"
          placeholder="איך עבר היום שלך?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          style={{
            borderRadius: '32px',
            padding: '24px',
            border: 'none',
            background: '#F9F9FC',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            fontSize: '1.05rem'
          }}
        />
      </div>

      <button className="btn" onClick={handleSave} disabled={saving} style={{
        background: 'var(--secondary)',
        color: 'white',
        padding: '20px',
        borderRadius: '32px',
        fontSize: '1.3rem',
        fontWeight: 900,
        boxShadow: '0 12px 32px rgba(42, 25, 230, 0.3)',
        width: '100%'
      }}>
        {saving ? '⏳ שומר...' : 'שמור תיעוד'}
      </button>
    </div>
  );
}
