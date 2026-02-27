import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../api/supabase';
import { DEFAULT_SYMPTOMS } from '../utils/constants';

export default function EventLogPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.id);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<{ id: string; name_he: string; icon: string }[]>([]);

  // Form state
  const [intensity, setIntensity] = useState(7);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Date display
  const now = useMemo(() => new Date(), []);
  const day = now.getDate();
  const minute = Math.floor(now.getMinutes() / 5) * 5;
  const monthNames = ['ינו\'', 'פבר\'', 'מרץ', 'אפר\'', 'מאי', 'יוני', 'יולי', 'אוג\'', 'ספט\'', 'אוק\'', 'נוב\'', 'דצמ\''];
  const monthLabel = `${monthNames[now.getMonth()]} ${day}`;

  useEffect(() => {
    supabase.from('symptom_options').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setSymptoms(data);
      } else {
        setSymptoms(DEFAULT_SYMPTOMS);
      }
    });
  }, []);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createEvent({
        event_type: 'general',
        intensity,
        pre_symptoms: selectedSymptoms,
        recent_food: [],
        food_notes: '',
        location_type: '',
        sleep_hours: 0,
        stress_level: 0,
        notes,
      });
      navigate('/breathing', { state: { fromEvent: true } });
    } catch {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  // Purple theme for event log
  const purple = '#8c2bee';
  const purpleBg = '#f7f6f8';
  const purpleGlow = 'rgba(140, 43, 238, 0.3)';

  return (
    <div style={{
      background: purpleBg,
      fontFamily: "'Inter', sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: `${purpleBg}cc`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            width: '40px',
            height: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px' }}>תיעוד אירוע</h1>
        <div style={{
          display: 'flex',
          width: '40px',
          height: '40px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: `${purple}1a`,
          color: purple,
          cursor: 'pointer',
        }}>
          <span className="material-symbols-outlined">check</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Date and Time Picker Section */}
        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', padding: '0 4px' }}>תאריך ושעה</h3>
          <div className="glass" style={{
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '8px',
          }}>
            {/* Day Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '4px' }}>יום</span>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {day - 1}
                </p>
                <p style={{
                  background: purple,
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${purpleGlow}`,
                }}>
                  {day}
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {day + 1}
                </p>
              </div>
            </div>

            {/* Minute Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '4px' }}>דקה</span>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(Math.max(0, minute - 5)).padStart(2, '0')}
                </p>
                <p style={{
                  background: `${purple}1a`,
                  color: purple,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {String(minute).padStart(2, '0')}
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(Math.min(55, minute + 5)).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Month Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '4px' }}>חודש</span>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {monthNames[now.getMonth()]} {day - 1}
                </p>
                <p style={{
                  background: `${purple}1a`,
                  color: purple,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {monthLabel}
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 700, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {monthNames[now.getMonth()]} {day + 1}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Intensity Slider */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', padding: '0 4px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>עוצמה (1-10)</h3>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: purple }}>{intensity}</span>
          </div>
          <div style={{ padding: '0 8px' }}>
            <div style={{ position: 'relative', height: '12px', width: '100%' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #4ade80, #f87171)',
                borderRadius: '9999px',
              }} />
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={intensity}
                onChange={e => setIntensity(+e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '12px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  direction: 'ltr',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-light)' }}>
              <span>קל</span>
              <span>בינוני</span>
              <span>חמור</span>
            </div>
          </div>
        </section>

        {/* Symptoms Selector */}
        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', padding: '0 4px' }}>תסמינים</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {symptoms.map(s => {
              const isSelected = selectedSymptoms.includes(s.name_he);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleSymptom(s.name_he)}
                  className="glass"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    ...(isSelected
                      ? {
                        border: `1px solid ${purple}66`,
                        background: `${purple}1a`,
                        color: purple,
                      }
                      : {
                        color: 'var(--text-secondary)',
                      }),
                  }}
                >
                  <span>{s.name_he}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Notes Section */}
        <section>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', padding: '0 4px' }}>הערות נוספות</h3>
          <textarea
            className="glass"
            placeholder="תאר את התחושות שלך..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              border: 'none',
              minHeight: '100px',
              resize: 'vertical',
              color: 'var(--text-primary)',
              textAlign: 'right',
            }}
          />
        </section>
      </main>

      {/* Bottom Action & Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
      }}>
        {/* Main Action Button */}
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              background: purple,
              color: 'white',
              fontWeight: 700,
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: `0 10px 30px -10px ${purpleGlow}`,
              transition: 'transform 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          >
            <span className="material-symbols-outlined">add_task</span>
            {saving ? 'שומר...' : 'תיעוד אירוע'}
          </button>
        </div>

        {/* Navigation Bar */}
        <nav style={{
          background: `${purpleBg}e6`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${purple}1a`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 16px 24px',
        }}>
          <a onClick={() => navigate('/')} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: purple,
            textDecoration: 'none',
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined">home</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>בית</span>
          </a>
          <a onClick={() => navigate('/history')} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-light)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>יומן</span>
          </a>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: purple,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginTop: '-32px',
            boxShadow: `0 4px 16px ${purpleGlow}`,
            border: `4px solid ${purpleBg}`,
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined">add</span>
          </div>
          <a onClick={() => navigate('/dashboard')} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-light)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined">bar_chart</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>סטטיסטיקה</span>
          </a>
          <a onClick={() => navigate('/settings')} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-light)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined">person</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>פרופיל</span>
          </a>
        </nav>
      </div>

      {/* Decorative Background Elements */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-10%',
        width: '256px',
        height: '256px',
        background: `${purple}1a`,
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '-10%',
        width: '320px',
        height: '320px',
        background: `${purple}0d`,
        filter: 'blur(120px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Custom range slider styles for purple theme */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid ${purple};
          box-shadow: 0 2px 8px rgba(140, 43, 238, 0.3);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 4px solid ${purple};
          box-shadow: 0 2px 8px rgba(140, 43, 238, 0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
