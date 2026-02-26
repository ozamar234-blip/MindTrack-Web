import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
        // Move to next phase
        setPhaseIndex(pi => {
          const nextPhase = (pi + 1) % PHASES.length;
          if (nextPhase === 0) {
            setRound(r => {
              if (r >= TOTAL_ROUNDS) {
                setIsActive(false);
                setIsComplete(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                // Save session
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
    <div className="page" style={{ background: 'var(--bg-warm)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '40px', paddingTop: '20px' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>תרגיל נשימה 🌬️</h1>
        <p className="page-subtitle" style={{ fontSize: '1rem', opacity: 0.8 }}>נשימת קופסה 4-4-4-4</p>
      </div>

      <div className="breathing-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
        {!isActive && !isComplete && (
          <div className="card" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 500 }}>
                שאיפה 4 שניות ← עצירה 4 שניות ← נשיפה 4 שניות ← עצירה 4 שניות
              </p>
              <div style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.9rem' }}>
                {TOTAL_ROUNDS} סיבובים
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem', borderRadius: 'var(--radius-sm)' }} onClick={start}>
              🫁 התחל תרגול
            </button>
          </div>
        )}

        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="breathing-circle"
              style={{
                width: '240px',
                height: '240px',
                background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}CC)`,
                transform: `scale(${scale})`,
                boxShadow: `0 20px 60px ${currentPhase.color}44`,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'white',
                border: '8px solid rgba(255,255,255,0.2)',
                transition: 'transform 1s linear, background 0.5s ease',
              }}
            >
              {currentPhase.name}
            </div>
            <div className="breathing-timer" style={{ fontSize: '4.5rem', fontWeight: 900, marginTop: '40px', letterSpacing: '-2px' }}>{timer}</div>
            <div className="breathing-phase" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>{currentPhase.name}</div>
            <div className="breathing-round" style={{ marginTop: '16px', fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--border)', padding: '4px 16px', borderRadius: 'var(--radius-full)' }}>סיבוב {round} מתוך {TOTAL_ROUNDS}</div>

            <button className="btn btn-ghost" style={{ marginTop: '48px', color: 'var(--text-secondary)', fontWeight: 600 }} onClick={() => { setIsActive(false); if (intervalRef.current) clearInterval(intervalRef.current); }}>
              עצור תרגיל
            </button>
          </div>
        )}

        {isComplete && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✨</div>
            <h2 style={{ marginBottom: '12px', fontSize: '1.8rem', fontWeight: 800 }}>כל הכבוד!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>סיימת את תרגיל הנשימה בהצלחה. הרגשת שיפור?</p>
            <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }} onClick={() => navigate(fromEvent ? '/' : -1 as never)}>
              חזרה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
