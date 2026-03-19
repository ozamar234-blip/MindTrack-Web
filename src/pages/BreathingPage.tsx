import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';

const PHASES = [
  { name: 'שאיפה', duration: 4, color: '#4A90D9' },
  { name: 'עצירה', duration: 4, color: '#00B894' },
  { name: 'נשיפה', duration: 4, color: '#E17055' },
  { name: 'עצירה', duration: 4, color: '#FDCB6E' },
];

const TOTAL_ROUNDS = 4;

export default function BreathingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromEvent = (location.state as { fromEvent?: boolean })?.fromEvent;

  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(4);
  const [round, setRound] = useState(1);
  const startTime = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const currentPhase = PHASES[phaseIndex];

  const tick = useCallback(() => {
    setTimer(prev => {
      if (prev <= 1) {
        setPhaseIndex(pi => {
          const nextPhase = (pi + 1) % PHASES.length;
          if (nextPhase === 0) {
            setRound(r => {
              if (r >= TOTAL_ROUNDS) {
                setIsActive(false);
                setIsComplete(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (user) {
                  const duration = Math.floor((Date.now() - startTime.current) / 1000);
                  supabase.from('breathing_sessions').insert({
                    user_id: user.id,
                    exercise_type: 'box_breathing',
                    duration_seconds: duration,
                    completed: true,
                  }).then(() => { });
                }
                return r;
              }
              return r + 1;
            });
          }
          return nextPhase;
        });
        return PHASES[(phaseIndex + 1) % PHASES.length].duration;
      }
      return prev - 1;
    });
  }, [phaseIndex, user]);

  const start = () => {
    setIsActive(true);
    setIsComplete(false);
    setPhaseIndex(0);
    setTimer(4);
    setRound(1);
    startTime.current = Date.now();
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, tick]);

  const scale = phaseIndex === 0 ? 1 + (1 - timer / 4) * 0.4 : phaseIndex === 2 ? 1.4 - (1 - timer / 4) * 0.4 : phaseIndex === 1 ? 1.4 : 1;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      minHeight: '100dvh',
      width: '100%',
      flexDirection: 'column',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      overflow: 'hidden',
      background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f6f6f8 100%)',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>air</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>תרגיל נשימה</h1>
        </div>
        <motion.div
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate(-1)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </motion.div>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        {!isActive && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '40px 32px',
              textAlign: 'center',
              borderRadius: '28px',
              background: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--primary)', marginBottom: '16px', display: 'block' }}>self_improvement</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>נשימת קופסה</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.8, fontSize: '0.9rem' }}>
              שאיפה 4 שניות ← עצירה 4 שניות <br /> נשיפה 4 שניות ← עצירה 4 שניות
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '32px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>loop</span>
              {TOTAL_ROUNDS} סיבובים
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '18px',
                fontSize: '1.1rem',
                borderRadius: '16px',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                width: '100%',
                boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: fromEvent ? '12px' : '0',
              }}
              onClick={start}
            >
              התחל תרגול
            </motion.button>
            {fromEvent && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: 'white',
                  fontFamily: 'inherit',
                }}
                onClick={() => navigate('/')}
              >
                דלג על הנשימה
              </motion.button>
            )}
          </motion.div>
        )}

        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div
              style={{
                width: 'min(220px, 55vw)',
                height: 'min(220px, 55vw)',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}CC)`,
                transform: `scale(${scale})`,
                boxShadow: `0 20px 60px ${currentPhase.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'white',
                border: '10px solid rgba(255,255,255,0.2)',
                transition: 'transform 1s linear, background 0.5s ease',
              }}
            >
              {currentPhase.name}
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 800, marginTop: '40px', color: 'var(--text-primary)' }}>{timer}</div>
            <div style={{ marginTop: '12px', fontWeight: 700, color: 'var(--text-light)', fontSize: '0.85rem', letterSpacing: '1px' }}>
              סיבוב {round} מתוך {TOTAL_ROUNDS}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: '48px',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '12px 32px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={() => { setIsActive(false); if (intervalRef.current) clearInterval(intervalRef.current); }}
            >
              עצור תרגיל
            </motion.button>
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '40px 32px',
              textAlign: 'center',
              borderRadius: '28px',
              background: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#10b981', marginBottom: '16px', display: 'block' }}>
              check_circle
            </span>
            <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>כל הכבוד!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>סיימת את תרגיל הנשימה בהצלחה</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px',
                fontSize: '1.05rem',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '16px',
                fontWeight: 700,
                width: '100%',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
              }}
              onClick={() => navigate(fromEvent ? '/' : -1 as never)}
            >
              סגור וחזור
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
