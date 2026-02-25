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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">צ׳ק-אין {checkinType === 'morning' ? '🌅 בוקר' : '🌙 ערב'}</h1>
        <p className="page-subtitle">ספר לנו איך אתה מרגיש</p>
      </div>

      {/* Mood */}
      <div className="card">
        <div className="card-header">מצב רוח</div>
        <div className="mood-selector">
          {MOOD_EMOJIS.map(m => (
            <button key={m.value} className={`mood-btn ${mood === m.value ? 'selected' : ''}`} onClick={() => setMood(m.value)}>
              <span className="mood-emoji">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="card">
        <div className="slider-container">
          <div className="slider-header">
            <span className="slider-label">רמת אנרגיה</span>
            <span className="slider-value">{energy}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={energy} onChange={e => setEnergy(+e.target.value)} />
        </div>

        <div className="slider-container">
          <div className="slider-header">
            <span className="slider-label">איכות שינה</span>
            <span className="slider-value">{sleepQuality}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={sleepQuality} onChange={e => setSleepQuality(+e.target.value)} />
        </div>

        <div className="slider-container">
          <div className="slider-header">
            <span className="slider-label">שעות שינה</span>
            <span className="slider-value">{sleepHours} שעות</span>
          </div>
          <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} />
        </div>

        <div className="slider-container">
          <div className="slider-header">
            <span className="slider-label">רמת לחץ</span>
            <span className="slider-value">{stress}/5</span>
          </div>
          <input type="range" min={1} max={5} step={1} value={stress} onChange={e => setStress(+e.target.value)} />
        </div>
      </div>

      {/* Activity */}
      <div className="card">
        <div className="card-header">פעילות גופנית</div>
        <div className="chips-container">
          {ACTIVITY_OPTIONS.map(a => (
            <button key={a.value} className={`chip ${activity === a.value ? 'selected' : ''}`} onClick={() => setActivity(a.value)}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <div className="card-header">הערות</div>
        <textarea className="input" placeholder="משהו נוסף שתרצה לשתף..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'שומר...' : '💾 שמור צ׳ק-אין'}
      </button>
    </div>
  );
}
