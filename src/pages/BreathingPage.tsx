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
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
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
          <span style={{ fontSize: '1.2rem' }}>🌬️</span>
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>תרגיל נשימה</span>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }} onClick={() => navigate(-1)}>✕</div>
      </div>

      <div className="breathing-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!isActive && !isComplete && (
          <div className="card" style={{
            padding: '48px 32px',
            textAlign: 'center',
            borderRadius: '44px',
            background: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🫁</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '20px' }}>נשימת קופסה</h2>
            <p style={{ color: '#666', marginBottom: '32px', lineHeight: 1.8, fontSize: '1rem', fontWeight: 700 }}>
              שאיפה 4 שניות ← עצירה 4 שניות <br /> נשיפה 4 שניות ← עצירה 4 שניות
            </p>
            <div style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '20px',
              fontWeight: 900,
              fontSize: '0.9rem',
              marginBottom: '40px'
            }}>
              {TOTAL_ROUNDS} סיבובים
            </div>
            <button className="btn" style={{
              padding: '20px 48px',
              fontSize: '1.2rem',
              borderRadius: '32px',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 900,
              width: '100%',
              boxShadow: '0 12px 32px rgba(127, 19, 236, 0.3)',
              marginBottom: fromEvent ? '12px' : '0'
            }} onClick={start}>
              התחל תרגול
            </button>
            {fromEvent && (
              <button className="btn-ghost" style={{
                width: '100%',
                padding: '16px',
                fontWeight: 800,
                color: '#8E8E93',
                fontSize: '1rem'
              }} onClick={() => navigate('/')}>
                דלג על התרגול
              </button>
            )}
          </div>
        )}

        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}CC)`,
                transform: `scale(${scale})`,
                boxShadow: `0 20px 60px ${currentPhase.color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'white',
                border: '12px solid rgba(255,255,255,0.2)',
                transition: 'transform 1s linear, background 0.5s ease',
              }}
            >
              {currentPhase.name}
            </div>
            <div style={{ fontSize: '5rem', fontWeight: 900, marginTop: '48px', color: '#1A1A1A' }}>{timer}</div>
            <div style={{ marginTop: '16px', fontWeight: 900, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '2px' }}>סיבוב {round} מתוך {TOTAL_ROUNDS}</div>

            <button className="btn-ghost" style={{ marginTop: '60px', color: '#666', fontWeight: 900, fontSize: '1.1rem' }} onClick={() => { setIsActive(false); if (intervalRef.current) clearInterval(intervalRef.current); }}>
              עצור תרגיל
            </button>
          </div>
        )}

        {isComplete && (
          <div className="card" style={{
            padding: '48px 32px',
            textAlign: 'center',
            borderRadius: '44px',
            background: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>✨</div>
            <h2 style={{ marginBottom: '16px', fontSize: '2rem', fontWeight: 900 }}>כל הכבוד!</h2>
            <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1rem', fontWeight: 700 }}>סיימת את תרגיל הנשימה בהצלחה. הרגשת שיפור?</p>
            <button className="btn" style={{
              padding: '20px 40px',
              fontSize: '1.2rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '32px',
              fontWeight: 900,
              width: '100%'
            }} onClick={() => navigate(fromEvent ? '/' : -1 as never)}>
              סגור וחזור
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
