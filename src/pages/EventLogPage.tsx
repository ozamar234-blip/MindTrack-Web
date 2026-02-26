import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../api/supabase';
import type { SymptomOption, FoodOption } from '../types';
import { LOCATION_OPTIONS } from '../utils/constants';

const STEPS = ['עוצמה', 'סימפטומים', 'אוכל', 'מיקום', 'שינה', 'לחץ', 'הערות'];

export default function EventLogPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.id);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomOption[]>([]);
  const [foods, setFoods] = useState<FoodOption[]>([]);

  // Form state
  const [intensity, setIntensity] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [foodNotes, setFoodNotes] = useState('');
  const [locationType, setLocationType] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    supabase.from('symptom_options').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setSymptoms(data);
    });
    supabase.from('food_options').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setFoods(data);
    });
  }, []);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  const toggleFood = (name: string) => {
    setSelectedFoods(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createEvent({
        event_type: 'general',
        intensity,
        pre_symptoms: selectedSymptoms,
        recent_food: selectedFoods,
        food_notes: foodNotes,
        location_type: locationType,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        notes,
      });
      navigate('/breathing', { state: { fromEvent: true } });
    } catch {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return true;
    if (step === 3) return locationType !== '';
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSave();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
    else navigate(-1);
  };

  const getIntensityColor = (val: number) => {
    if (val <= 3) return '#00B894';
    if (val <= 6) return '#FDCB6E';
    if (val <= 8) return '#E17055';
    return '#FF6B6B';
  };

  return (
    <div className="page" style={{ paddingBottom: '120px' }}>
      <div className="page-header" style={{ marginBottom: '24px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>רישום אירוע 📝</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>שלב {step + 1} מתוך {STEPS.length}: {STEPS[step]}</p>
      </div>

      {/* Progress Bar */}
      <div className="wizard-progress" style={{ marginBottom: '32px', gap: '8px' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`wizard-step ${i < step ? 'completed' : i === step ? 'active' : ''}`}
            style={{
              height: '6px',
              borderRadius: '10px',
              background: i <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.4s ease',
              opacity: i === step ? 1 : i < step ? 0.6 : 0.3
            }}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="card" style={{
        minHeight: '320px',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        background: 'white',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {step === 0 && (
          <div className="slider-container">
            <div className="slider-header" style={{ marginBottom: '20px' }}>
              <span className="slider-label" style={{ fontSize: '1.2rem', fontWeight: 800 }}>מה עוצמת האירוע?</span>
              <span className="slider-value" style={{
                fontSize: '2rem',
                color: getIntensityColor(intensity),
                background: `${getIntensityColor(intensity)}11`,
                padding: '4px 16px',
                borderRadius: 'var(--radius-full)'
              }}>{intensity}/10</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={intensity} onChange={e => setIntensity(+e.target.value)} style={{ height: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '12px', fontWeight: 600 }}>
              <span>רגוע/קל</span><span>חריף מאוד</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="card-header" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>מה הרגשת קודם?</div>
            <div className="chips-container" style={{ gap: '10px' }}>
              {symptoms.map(s => (
                <button
                  key={s.id}
                  className={`chip ${selectedSymptoms.includes(s.name_he) ? 'selected' : ''}`}
                  onClick={() => toggleSymptom(s.name_he)}
                  style={{ padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }}
                >
                  <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>{s.icon}</span> {s.name_he}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="card-header" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>מה אכלת או שתית?</div>
            <div className="chips-container" style={{ gap: '10px', marginBottom: '24px' }}>
              {foods.map(f => (
                <button
                  key={f.id}
                  className={`chip ${selectedFoods.includes(f.name_he) ? 'selected' : ''}`}
                  onClick={() => toggleFood(f.name_he)}
                  style={{ padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }}
                >
                  <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>{f.icon}</span> {f.name_he}
                </button>
              ))}
            </div>
            <div className="input-group">
              <input className="input" placeholder="הערות לגבי אוכל (אופציונלי)..." value={foodNotes} onChange={e => setFoodNotes(e.target.value)} style={{ padding: '16px', borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card-header" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>איפה אתה נמצא?</div>
            <div className="quick-select-grid" style={{ gap: '12px' }}>
              {LOCATION_OPTIONS.map(loc => (
                <button
                  key={loc.value}
                  className={`quick-select-item ${locationType === loc.value ? 'selected' : ''}`}
                  onClick={() => setLocationType(loc.value)}
                  style={{ padding: '20px 10px', borderRadius: 'var(--radius-sm)' }}
                >
                  <span className="quick-select-icon" style={{ fontSize: '2rem' }}>{loc.icon}</span>
                  <span style={{ fontWeight: 600, marginTop: '4px' }}>{loc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="slider-container">
            <div className="slider-header" style={{ marginBottom: '20px' }}>
              <span className="slider-label" style={{ fontSize: '1.2rem', fontWeight: 800 }}>שעות שינה</span>
              <span className="slider-value" style={{
                fontSize: '2rem',
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '4px 16px',
                borderRadius: 'var(--radius-full)'
              }}>{sleepHours} ש׳</span>
            </div>
            <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} />
          </div>
        )}

        {step === 5 && (
          <div className="slider-container">
            <div className="slider-header" style={{ marginBottom: '20px' }}>
              <span className="slider-label" style={{ fontSize: '1.2rem', fontWeight: 800 }}>רמת לחץ</span>
              <span className="slider-value" style={{
                fontSize: '2rem',
                color: getIntensityColor(stressLevel),
                background: `${getIntensityColor(stressLevel)}11`,
                padding: '4px 16px',
                borderRadius: 'var(--radius-full)'
              }}>{stressLevel}/10</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={stressLevel} onChange={e => setStressLevel(+e.target.value)} />
          </div>
        )}

        {step === 6 && (
          <div>
            <div className="card-header" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>הערות נוספות</div>
            <textarea
              className="input"
              placeholder="תאר במילים שלך מה קרה..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
              style={{ padding: '16px', borderRadius: 'var(--radius-sm)', lineHeight: '1.6' }}
            />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-outline" style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', fontWeight: 700 }} onClick={prev}>
          {step === 0 ? 'ביטול' : '← חזרה'}
        </button>
        <button className="btn btn-primary" style={{ flex: 2, padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '1.1rem', boxShadow: '0 8px 25px var(--primary-glow)' }} onClick={next} disabled={!canNext() || saving}>
          {step === STEPS.length - 1 ? (saving ? '⏳ שומר...' : '💾 שמור וסיים') : 'המשך לשלב הבא'}
        </button>
      </div>
    </div>
  );
}
