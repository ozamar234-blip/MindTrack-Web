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
          <span style={{ fontSize: '1.2rem' }}>📝</span>
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>תיעוד אירוע</span>
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
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '8px' }}>{STEPS[step]}</h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>שלב {step + 1} מתוך {STEPS.length}</p>
      </div>

      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '40px',
        padding: '0 8px'
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: i <= step ? 'var(--secondary)' : '#E0E0E0',
              transition: 'all 0.4s ease'
            }}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="card" style={{
        minHeight: '400px',
        padding: '32px',
        borderRadius: '40px',
        background: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⚡</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px' }}>מה עוצמת האירוע?</h2>
            <div style={{
              fontSize: '4rem',
              fontWeight: 900,
              color: getIntensityColor(intensity),
              marginBottom: '24px'
            }}>{intensity}</div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={intensity}
              onChange={e => setIntensity(+e.target.value)}
              style={{ width: '100%', accentColor: getIntensityColor(intensity) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#8E8E93', marginTop: '16px', fontWeight: 700 }}>
              <span>רגוע</span><span>סוער</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>מה הרגשת קודם?</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {symptoms.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.name_he)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '24px',
                    border: 'none',
                    background: selectedSymptoms.includes(s.name_he) ? 'var(--secondary-light)' : '#F5F5F9',
                    color: selectedSymptoms.includes(s.name_he) ? 'var(--secondary)' : '#333',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: selectedSymptoms.includes(s.name_he) ? '2px solid var(--secondary)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>{s.icon}</span> {s.name_he}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>מה אכלת או שתית?</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
              {foods.map(f => (
                <button
                  key={f.id}
                  onClick={() => toggleFood(f.name_he)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '24px',
                    border: 'none',
                    background: selectedFoods.includes(f.name_he) ? 'var(--secondary-light)' : '#F5F5F9',
                    color: selectedFoods.includes(f.name_he) ? 'var(--secondary)' : '#333',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: selectedFoods.includes(f.name_he) ? '2px solid var(--secondary)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginLeft: '6px' }}>{f.icon}</span> {f.name_he}
                </button>
              ))}
            </div>
            <input
              className="input"
              placeholder="הערות לגבי אוכל (אופציונלי)..."
              value={foodNotes}
              onChange={e => setFoodNotes(e.target.value)}
              style={{ padding: '16px', borderRadius: '20px', background: '#F9F9FC' }}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px', textAlign: 'center' }}>איפה אתה נמצא?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {LOCATION_OPTIONS.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => setLocationType(loc.value)}
                  style={{
                    padding: '24px 16px',
                    borderRadius: '24px',
                    border: 'none',
                    background: locationType === loc.value ? 'var(--secondary-light)' : '#F5F5F9',
                    color: locationType === loc.value ? 'var(--secondary)' : '#333',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    outline: locationType === loc.value ? '2px solid var(--secondary)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{loc.icon}</span>
                  <span style={{ fontWeight: 800 }}>{loc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px' }}>כמה שעות ישנת?</h2>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--secondary)', marginBottom: '24px' }}>{sleepHours}</div>
            <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} style={{ width: '100%' }} />
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>😫</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '32px' }}>מה רמת הלחץ שלך?</h2>
            <div style={{
              fontSize: '4rem',
              fontWeight: 900,
              color: getIntensityColor(stressLevel),
              marginBottom: '24px'
            }}>{stressLevel}</div>
            <input type="range" min={1} max={10} step={1} value={stressLevel} onChange={e => setStressLevel(+e.target.value)} style={{ width: '100%', accentColor: getIntensityColor(stressLevel) }} />
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>הערות נוספות</h2>
            <textarea
              className="input"
              placeholder="תאר במילים שלך מה קרה..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
              style={{ padding: '24px', borderRadius: '32px', background: '#F9F9FC', fontSize: '1.1rem' }}
            />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn-ghost" style={{ flex: 1, padding: '20px', borderRadius: '32px', fontWeight: 900, fontSize: '1.1rem' }} onClick={prev}>
          {step === 0 ? 'ביטול' : 'חזרה'}
        </button>
        <button className="btn" style={{ flex: 2, padding: '20px', borderRadius: '32px', background: 'var(--secondary)', color: 'white', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 12px 32px rgba(42, 25, 230, 0.3)' }} onClick={next} disabled={!canNext() || saving}>
          {step === STEPS.length - 1 ? (saving ? '⌛ שומר...' : 'סיום ותיעוד') : 'המשך'}
        </button>
      </div>
    </div>
  );
}
