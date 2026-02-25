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
                  }).then(() => {});
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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">תרגיל נשימה 🌬️</h1>
        <p className="page-subtitle">נשימת קופסה 4-4-4-4</p>
      </div>

      <div className="breathing-container">
        {!isActive && !isComplete && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ color: '#636E72', marginBottom: 16, lineHeight: 1.8 }}>
                שאיפה 4 שניות → עצירה 4 שניות → נשיפה 4 שניות → עצירה 4 שניות
              </p>
              <p style={{ color: '#636E72' }}>{TOTAL_ROUNDS} סיבובים</p>
            </div>
            <button className="btn btn-primary" style={{ maxWidth: 200 }} onClick={start}>
              🫁 התחל
            </button>
          </>
        )}

        {isActive && (
          <>
            <div
              className="breathing-circle"
              style={{
                background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}CC)`,
                transform: `scale(${scale})`,
                boxShadow: `0 0 40px ${currentPhase.color}66`,
              }}
            >
              {currentPhase.name}
            </div>
            <div className="breathing-timer">{timer}</div>
            <div className="breathing-phase">{currentPhase.name}</div>
            <div className="breathing-round">סיבוב {round} מתוך {TOTAL_ROUNDS}</div>
            <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => { setIsActive(false); if (intervalRef.current) clearInterval(intervalRef.current); }}>
              עצור
            </button>
          </>
        )}

        {isComplete && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✨</div>
            <h2 style={{ marginBottom: 8 }}>כל הכבוד!</h2>
            <p style={{ color: '#636E72', marginBottom: 24 }}>סיימת את תרגיל הנשימה בהצלחה</p>
            <button className="btn btn-primary" style={{ maxWidth: 200 }} onClick={() => navigate(fromEvent ? '/' : -1 as never)}>
              סיום
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
