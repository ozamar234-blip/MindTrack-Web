import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { supabase } from '../api/supabase';
import { DEFAULT_SYMPTOMS, FOOD_OPTIONS, LOCATION_OPTIONS } from '../utils/constants';

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

/* ─── Constants ─── */
const TOTAL_STEPS = 7;
const purple = '#8c2bee';
const purpleBg = '#f7f6f8';
const purpleGlow = 'rgba(140, 43, 238, 0.3)';

/* ─── Main EventLogPage ─── */
export default function EventLogPage() {
  const { user } = useAuth();
  const { createEvent } = useEvents(user?.id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<{ id: string; name_he: string; icon: string }[]>([]);

  // Form data
  const [intensity, setIntensity] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [foodNotes, setFoodNotes] = useState('');
  const [locationKey, setLocationKey] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');

  // Date picker
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

  const toggleFood = (value: string) => {
    setSelectedFoods(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    );
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert('לא מחובר — יש להתחבר מחדש');
      return;
    }
    setSaving(true);
    try {
      const foodLabels = selectedFoods.map(v => {
        const f = FOOD_OPTIONS.find(o => o.value === v);
        return f ? f.label : v;
      });
      await createEvent({
        event_type: 'general',
        intensity,
        pre_symptoms: selectedSymptoms,
        recent_food: foodLabels,
        food_notes: foodNotes,
        location_type: locationKey,
        sleep_hours: sleepHours,
        stress_level: null,
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

  /* ─── Step Content Renderer ─── */
  const renderStep = () => {
    switch (step) {
      /* ── Step 1: Date & Time ── */
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>מתי זה קרה?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>בחרו את התאריך והשעה של האירוע</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              padding: '16px 12px',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600, color: purple }}>
                {selectedDateLabel}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
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
            </div>
          </div>
        );

      /* ── Step 2: Intensity ── */
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>מה העוצמה?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>דרגו את עוצמת האירוע מ-1 עד 10</p>
            </div>
            <motion.div
              key={intensity}
              initial={{ scale: 1.2, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              style={{ textAlign: 'center', fontSize: '4rem', fontWeight: 800, color: purple }}
            >
              {intensity}
            </motion.div>
            <div style={{ padding: '0 4px' }}>
              <div style={{ position: 'relative', height: '12px', width: '100%' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #4ade80, #facc15, #f87171)', borderRadius: '9999px' }} />
                <input
                  type="range" min={1} max={10} step={1} value={intensity}
                  onChange={e => setIntensity(+e.target.value)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '12px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer', direction: 'ltr' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', direction: 'ltr' }}>
                <span>קל</span><span>בינוני</span><span>חמור</span>
              </div>
            </div>
          </div>
        );

      /* ── Step 3: Symptoms ── */
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>אילו תסמינים?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>בחרו את התסמינים שחוויתם</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {symptoms.map((s) => {
                const isSelected = selectedSymptoms.includes(s.name_he);
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleSymptom(s.name_he)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      border: isSelected ? `2px solid ${purple}` : '2px solid rgba(226,232,240,0.6)',
                      background: isSelected ? `${purple}1a` : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      color: isSelected ? purple : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{s.name_he}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      /* ── Step 4: Food ── */
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>מה אכלת לאחרונה?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>סמנו את המזון שצרכתם לפני האירוע</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {FOOD_OPTIONS.map((f) => {
                const isSelected = selectedFoods.includes(f.value);
                return (
                  <motion.button
                    key={f.value}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleFood(f.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '9999px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      border: isSelected ? `2px solid ${purple}` : '2px solid rgba(226,232,240,0.6)',
                      background: isSelected ? `${purple}1a` : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      color: isSelected ? purple : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                    <span>{f.label}</span>
                  </motion.button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="הערות על אוכל (אופציונלי)..."
              value={foodNotes}
              onChange={e => setFoodNotes(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '16px',
                padding: '0 16px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                border: '2px solid rgba(226,232,240,0.6)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                outline: 'none',
                color: 'var(--text-primary)',
                textAlign: 'right',
              }}
              onFocus={e => { e.target.style.borderColor = purple; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.6)'; }}
            />
          </div>
        );

      /* ── Step 5: Location ── */
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>איפה היית?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>בחרו את המיקום שלכם בזמן האירוע</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {LOCATION_OPTIONS.map((loc) => {
                const isSelected = locationKey === loc.value;
                return (
                  <motion.button
                    key={loc.value}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setLocationKey(loc.value)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '20px 12px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      border: isSelected ? `2px solid ${purple}` : '2px solid rgba(226,232,240,0.6)',
                      background: isSelected ? `${purple}1a` : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 16px ${purpleGlow}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{loc.icon}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? purple : 'var(--text-secondary)',
                    }}>{loc.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      /* ── Step 6: Sleep ── */
      case 6:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>כמה שעות ישנת?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>שעות שינה בלילה האחרון</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '5rem' }}>😴</span>
              <motion.div
                key={sleepHours}
                initial={{ scale: 1.2, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: '2.5rem', fontWeight: 800, color: purple }}
              >
                {sleepHours} שעות
              </motion.div>
            </div>
            <div style={{ padding: '0 4px' }}>
              <div style={{ position: 'relative', height: '12px', width: '100%' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${purple}44, ${purple})`, borderRadius: '9999px' }} />
                <input
                  type="range" min={0} max={14} step={1} value={sleepHours}
                  onChange={e => setSleepHours(+e.target.value)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '12px', WebkitAppearance: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer', direction: 'ltr' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', direction: 'ltr' }}>
                <span>0</span><span>7</span><span>14</span>
              </div>
            </div>
          </div>
        );

      /* ── Step 7: Notes ── */
      case 7:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>הערות נוספות</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>תארו בחופשיות מה הרגשתם</p>
            </div>
            <textarea
              placeholder="ספרו לנו עוד על מה שקרה..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '20px',
                padding: '20px',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                outline: 'none',
                border: '2px solid rgba(226,232,240,0.6)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                minHeight: '140px',
                resize: 'vertical',
                color: 'var(--text-primary)',
                textAlign: 'right',
                lineHeight: 1.7,
              }}
              onFocus={e => { e.target.style.borderColor = purple; e.target.style.boxShadow = `0 0 0 3px ${purple}1a`; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.6)'; e.target.style.boxShadow = 'none'; }}
            />

            {/* Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(226,232,240,0.4)',
            }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: purple, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>סיכום</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedDateLabel}</span>
                  <span>📅 תאריך</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{intensity}/10</span>
                  <span>💪 עוצמה</span>
                </div>
                {selectedSymptoms.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{selectedSymptoms.join(', ')}</span>
                    <span>🩺 תסמינים</span>
                  </div>
                )}
                {locationKey && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{LOCATION_OPTIONS.find(l => l.value === locationKey)?.label}</span>
                    <span>📍 מיקום</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{sleepHours} שעות</span>
                  <span>😴 שינה</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: purpleBg,
      fontFamily: "'Inter', 'Heebo', sans-serif",
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: `${purpleBg}e6`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate('/')} style={{ display: 'flex', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-primary)' }}>
          <span className="material-symbols-outlined">close</span>
        </motion.button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>תיעוד אירוע</h1>
          <span style={{ fontSize: '0.7rem', color: purple, fontWeight: 600 }}>{step} מתוך {TOTAL_STEPS}</span>
        </div>
        <div style={{ width: '40px' }} />
      </header>

      {/* Progress Bar */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '4px' }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: i < step ? purple : `${purple}22`,
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {/* Step Content */}
      <div style={{ flex: 1, padding: '12px 16px', position: 'relative', overflowY: 'auto' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ width: '100%' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        padding: '12px 16px',
        paddingBottom: '28px',
        display: 'flex',
        gap: '12px',
        background: `linear-gradient(to top, ${purpleBg} 70%, transparent)`,
      }}>
        {step > 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goBack}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '16px',
              border: `2px solid ${purple}33`,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              color: purple,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            הקודם
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={step === TOTAL_STEPS ? handleSave : goNext}
          disabled={saving}
          style={{
            flex: step > 1 ? 1.5 : 1,
            height: '52px',
            borderRadius: '16px',
            border: 'none',
            background: purple,
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: `0 8px 24px -8px ${purpleGlow}`,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {step === TOTAL_STEPS ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              {saving ? 'שומר...' : 'שמירה'}
            </>
          ) : (
            <>
              הבא
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Background blurs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '256px', height: '256px', background: `${purple}1a`, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '320px', height: '320px', background: `${purple}0d`, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%;
          background: white; border: 4px solid ${purple}; box-shadow: 0 2px 8px rgba(140,43,238,0.3); cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px; height: 28px; border-radius: 50%;
          background: white; border: 4px solid ${purple}; box-shadow: 0 2px 8px rgba(140,43,238,0.3); cursor: pointer;
        }
      `}</style>
    </div>
  );
}
