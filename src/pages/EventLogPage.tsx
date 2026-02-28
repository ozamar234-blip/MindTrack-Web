import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../api/supabase';
import { DEFAULT_SYMPTOMS } from '../utils/constants';

/* ─── Scroll-Wheel Picker Column ─── */
interface WheelPickerProps {
  items: { label: string; value: number }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  accent: string;
}

function WheelPicker({ items, selectedIndex, onSelect, accent }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 44;
  const isScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_H;
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    isScrolling.current = true;
    scrollTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      onSelect(clamped);
      isScrolling.current = false;
    }, 80);
  }, [items.length, onSelect]);

  return (
    <div style={{ position: 'relative', height: ITEM_H * 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H, background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H, background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: ITEM_H, left: 4, right: 4, height: ITEM_H, background: `${accent}1a`, borderRadius: '10px', zIndex: 1, pointerEvents: 'none' }} />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div style={{ height: ITEM_H }} />
        {items.map((itm, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={`${itm.value}-${i}`}
              onClick={() => {
                if (!isScrolling.current) {
                  onSelect(i);
                  containerRef.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
                }
              }}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isSelected ? '1rem' : '0.875rem',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? accent : 'var(--text-light)',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
            >
              {itm.label}
            </div>
          );
        })}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

/* ─── Main EventLogPage ─── */
export default function EventLogPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.id);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<{ id: string; name_he: string; icon: string }[]>([]);

  const [intensity, setIntensity] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const now = new Date();
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  const dayItems = Array.from({ length: 17 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 14 + i);
    return { label: `${d.getDate()}`, value: d.getDate(), fullDate: new Date(d) };
  });
  const todayDayIdx = 14;

  const hourItems = Array.from({ length: 24 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }));

  const minuteItems = Array.from({ length: 12 }, (_, i) => ({
    label: String(i * 5).padStart(2, '0'),
    value: i * 5,
  }));

  const [selectedDayIdx, setSelectedDayIdx] = useState(todayDayIdx);
  const [selectedHourIdx, setSelectedHourIdx] = useState(now.getHours());
  const [selectedMinuteIdx, setSelectedMinuteIdx] = useState(Math.floor(now.getMinutes() / 5));

  const selectedDate = (() => {
    const base = dayItems[selectedDayIdx]?.fullDate || now;
    const d = new Date(base);
    d.setHours(hourItems[selectedHourIdx]?.value || 0);
    d.setMinutes(minuteItems[selectedMinuteIdx]?.value || 0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  })();

  const selectedDateLabel = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} · ${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`;

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
    if (!user?.id) {
      alert('לא מחובר — יש להתחבר מחדש');
      return;
    }
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
        started_at: selectedDate.toISOString(),
      });
      navigate('/breathing', { state: { fromEvent: true } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as Record<string, unknown>).message) : JSON.stringify(err);
      console.error('Event save error:', err);
      alert(`שגיאה בשמירה:\n${msg}`);
    } finally {
      setSaving(false);
    }
  };

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
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
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
        }}
      >
        <motion.div whileTap={{ scale: 0.85 }} onClick={() => navigate('/')} style={{ display: 'flex', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </motion.div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px' }}>תיעוד אירוע</h1>
        <motion.div whileTap={{ scale: 0.85 }} onClick={handleSave} style={{ display: 'flex', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `${purple}1a`, color: purple, cursor: 'pointer' }}>
          <span className="material-symbols-outlined">check</span>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0 16px 200px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Date and Time Picker */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>תאריך ושעה</h3>
            <span style={{ fontSize: '0.75rem', color: purple, fontWeight: 600 }}>{selectedDateLabel}</span>
          </div>
          <div className="glass" style={{ borderRadius: '16px', padding: '12px 8px', display: 'flex', gap: '4px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>יום</span>
              <WheelPicker items={dayItems} selectedIndex={selectedDayIdx} onSelect={setSelectedDayIdx} accent={purple} />
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', margin: '24px 0' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>שעה</span>
              <WheelPicker items={hourItems} selectedIndex={selectedHourIdx} onSelect={setSelectedHourIdx} accent={purple} />
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', margin: '24px 0' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>דקה</span>
              <WheelPicker items={minuteItems} selectedIndex={selectedMinuteIdx} onSelect={setSelectedMinuteIdx} accent={purple} />
            </div>
          </div>
        </motion.section>

        {/* Intensity Slider */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', padding: '0 4px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>עוצמה (1-10)</h3>
            <motion.span key={intensity} initial={{ scale: 1.3, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: '1.5rem', fontWeight: 700, color: purple }}>{intensity}</motion.span>
          </div>
          <div style={{ padding: '0 8px' }}>
            <div style={{ position: 'relative', height: '12px', width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #4ade80, #facc15, #f87171)', borderRadius: '9999px' }} />
              <input type="range" min={1} max={10} step={1} value={intensity} onChange={e => setIntensity(+e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '12px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer', direction: 'ltr' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-light)' }}>
              <span>קל</span><span>בינוני</span><span>חמור</span>
            </div>
          </div>
        </motion.section>

        {/* Symptoms Selector */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', padding: '0 4px' }}>תסמינים</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <AnimatePresence>
              {symptoms.map(s => {
                const isSelected = selectedSymptoms.includes(s.name_he);
                return (
                  <motion.div
                    key={s.id}
                    layout
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleSymptom(s.name_he)}
                    className="glass"
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s, border 0.2s, color 0.2s',
                      ...(isSelected ? { border: `1px solid ${purple}66`, background: `${purple}1a`, color: purple } : { color: 'var(--text-secondary)' }),
                    }}
                  >
                    <span>{s.name_he}</span>
                    {isSelected && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</motion.span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Notes Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px', padding: '0 4px' }}>הערות נוספות</h3>
          <textarea className="glass" placeholder="תאר את התחושות שלך..." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', borderRadius: '16px', padding: '16px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', border: 'none', minHeight: '100px', resize: 'vertical', color: 'var(--text-primary)', textAlign: 'right' }} />
        </motion.section>
      </main>

      {/* Bottom Action & Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{ padding: '0 16px 16px' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving} style={{ width: '100%', background: purple, color: 'white', fontWeight: 700, padding: '16px', borderRadius: '16px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: `0 10px 30px -10px ${purpleGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontFamily: 'inherit' }}>
            <span className="material-symbols-outlined">add_task</span>
            {saving ? 'שומר...' : 'תיעוד אירוע'}
          </motion.button>
        </div>
        <nav style={{ background: `${purpleBg}e6`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${purple}1a`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 16px 24px' }}>
          <a onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: purple, textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">home</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>בית</span>
          </a>
          <a onClick={() => navigate('/history')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-light)', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>יומן</span>
          </a>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginTop: '-32px', boxShadow: `0 4px 16px ${purpleGlow}`, border: `4px solid ${purpleBg}`, cursor: 'pointer' }}>
            <span className="material-symbols-outlined">add</span>
          </div>
          <a onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-light)', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">bar_chart</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>סטטיסטיקה</span>
          </a>
          <a onClick={() => navigate('/settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-light)', textDecoration: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">person</span>
            <span style={{ fontSize: '10px', fontWeight: 500 }}>פרופיל</span>
          </a>
        </nav>
      </div>

      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '256px', height: '256px', background: `${purple}1a`, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '320px', height: '320px', background: `${purple}0d`, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;
          background: white; border: 4px solid ${purple}; box-shadow: 0 2px 8px rgba(140,43,238,0.3); cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: white; border: 4px solid ${purple}; box-shadow: 0 2px 8px rgba(140,43,238,0.3); cursor: pointer;
        }
      `}</style>
    </div>
  );
}
