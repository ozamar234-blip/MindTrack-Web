import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../api/supabase';
import type { SymptomOption, FoodOption } from '../types';
import { LOCATION_OPTIONS } from '../utils/constants';
import { ArrowRight, ArrowLeft } from 'lucide-react';

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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">רישום אירוע 📝</h1>
        <p className="page-subtitle">שלב {step + 1} מתוך {STEPS.length}: {STEPS[step]}</p>
      </div>

      {/* Progress */}
      <div className="wizard-progress">
        {STEPS.map((_, i) => (
          <div key={i} className={`wizard-step ${i < step ? 'completed' : i === step ? 'active' : ''}`} />
        ))}
      </div>

      {/* Step Content */}
      <div className="card" style={{ minHeight: 260 }}>
        {step === 0 && (
          <div>
            <div className="slider-container">
              <div className="slider-header">
                <span className="slider-label">עוצמת האירוע</span>
                <span className="slider-value" style={{ color: getIntensityColor(intensity) }}>{intensity}/10</span>
              </div>
              <input type="range" min={1} max={10} step={1} value={intensity} onChange={e => setIntensity(+e.target.value)} style={{ accentColor: getIntensityColor(intensity) }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#636E72', marginTop: 4 }}>
                <span>קל</span><span>חזק מאוד</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="card-header">מה הרגשת לפני?</div>
            <div className="chips-container">
              {symptoms.map(s => (
                <button key={s.id} className={`chip ${selectedSymptoms.includes(s.name_he) ? 'selected' : ''}`} onClick={() => toggleSymptom(s.name_he)}>
                  {s.icon} {s.name_he}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="card-header">מה אכלת/שתית לאחרונה?</div>
            <div className="chips-container">
              {foods.map(f => (
                <button key={f.id} className={`chip ${selectedFoods.includes(f.name_he) ? 'selected' : ''}`} onClick={() => toggleFood(f.name_he)}>
                  {f.icon} {f.name_he}
                </button>
              ))}
            </div>
            <div className="input-group" style={{ marginTop: 12 }}>
              <input className="input" placeholder="הערות לגבי אוכל..." value={foodNotes} onChange={e => setFoodNotes(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card-header">איפה אתה?</div>
            <div className="quick-select-grid">
              {LOCATION_OPTIONS.map(loc => (
                <button key={loc.value} className={`quick-select-item ${locationType === loc.value ? 'selected' : ''}`} onClick={() => setLocationType(loc.value)}>
                  <span className="quick-select-icon">{loc.icon}</span>
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="slider-container">
              <div className="slider-header">
                <span className="slider-label">שעות שינה אחרונות</span>
                <span className="slider-value">{sleepHours} שעות</span>
              </div>
              <input type="range" min={0} max={12} step={0.5} value={sleepHours} onChange={e => setSleepHours(+e.target.value)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="slider-container">
              <div className="slider-header">
                <span className="slider-label">רמת לחץ/מתח</span>
                <span className="slider-value" style={{ color: getIntensityColor(stressLevel) }}>{stressLevel}/10</span>
              </div>
              <input type="range" min={1} max={10} step={1} value={stressLevel} onChange={e => setStressLevel(+e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#636E72', marginTop: 4 }}>
                <span>רגוע</span><span>לחוץ מאוד</span>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div className="card-header">הערות חופשיות</div>
            <textarea className="input" placeholder="תאר את מה שקורה..." value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={prev}>
          <ArrowRight size={18} /> {step === 0 ? 'ביטול' : 'חזרה'}
        </button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={next} disabled={!canNext() || saving}>
          {step === STEPS.length - 1 ? (saving ? 'שומר...' : '💾 שמירה') : 'הבא'}
          {step < STEPS.length - 1 && <ArrowLeft size={18} />}
        </button>
      </div>
    </div>
  );
}
