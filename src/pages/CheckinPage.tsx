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
  const [energy, setEnergy] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [stress, setStress] = useState(3);
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
    <div className="page" style={{ paddingBottom: '120px' }}>
      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>צ׳ק-אין {checkinType === 'morning' ? '🌅 בוקר' : '🌙 ערב'}</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>ספר לנו איך אתה מרגיש ברגע זה</p>
      </div>

      {/* Mood Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
        <div className="card-header" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>איך מצב הרוח שלך?</div>
        <div className="mood-selector" style={{ gap: '8px' }}>
          {MOOD_EMOJIS.map(m => (
            <button
              key={m.value}
              className={`mood-btn ${mood === m.value ? 'selected' : ''}`}
              onClick={() => setMood(m.value)}
              style={{ padding: '16px 8px', borderRadius: 'var(--radius-sm)' }}
            >
              <span className="mood-emoji" style={{ fontSize: '2.2rem' }}>{m.emoji}</span>
              <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
        <div className="slider-container" style={{ marginBottom: '28px' }}>
          <div className="slider-header" style={{ marginBottom: '12px' }}>
            <span className="slider-label" style={{ fontWeight: 700 }}>⚡ רמת אנרגיה</span>
            <span className="slider-value" style={{ background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 800 }}>{energy}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={energy} onChange={e => setEnergy(+e.target.value)} />
        </div>

        <div className="slider-container" style={{ marginBottom: '28px' }}>
          <div className="slider-header" style={{ marginBottom: '12px' }}>
            <span className="slider-label" style={{ fontWeight: 700 }}>🛌 איכות שינה</span>
            <span className="slider-value" style={{ background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 800 }}>{sleepQuality}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={sleepQuality} onChange={e => setSleepQuality(+e.target.value)} />
        </div>

        <div className="slider-container" style={{ marginBottom: '28px' }}>
          <div className="slider-header" style={{ marginBottom: '12px' }}>
            <span className="slider-label" style={{ fontWeight: 700 }}>🕒 שעות שינה</span>
            <span className="slider-value" style={{ background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 800 }}>{sleepHours} שעות</span>
          </div>
          <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} />
        </div>

        <div className="slider-container">
          <div className="slider-header" style={{ marginBottom: '12px' }}>
            <span className="slider-label" style={{ fontWeight: 700 }}>😫 רמת לחץ</span>
            <span className="slider-value" style={{ background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontWeight: 800 }}>{stress}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={stress} onChange={e => setStress(+e.target.value)} />
        </div>
      </div>

      {/* Activity Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
        <div className="card-header" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>מה עשית היום?</div>
        <div className="chips-container" style={{ gap: '10px' }}>
          {ACTIVITY_OPTIONS.map(a => (
            <button
              key={a.value}
              className={`chip ${activity === a.value ? 'selected' : ''}`}
              onClick={() => setActivity(a.value)}
              style={{ padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }}
            >
              <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)', marginBottom: '32px' }}>
        <div className="card-header" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>הערות אישיות</div>
        <textarea
          className="input"
          placeholder="משהו נוסף שתרצה לשתף..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{ borderRadius: 'var(--radius-sm)', padding: '16px' }}
        />
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{
        padding: '18px',
        fontSize: '1.2rem',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 8px 25px var(--primary-glow)'
      }}>
        {saving ? '⏳ שומר...' : '💾 שמור צ׳ק-אין'}
      </button>
    </div>
  );
}
