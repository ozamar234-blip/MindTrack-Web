import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';

// ═══════════════════════════════════════════
// Ambient Sound Generator using Web Audio API
// ═══════════════════════════════════════════

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'גשם', emoji: '🌧️' },
  { id: 'ocean', label: 'אוקיינוס', emoji: '🌊' },
  { id: 'forest', label: 'יער', emoji: '🌿' },
  { id: 'wind', label: 'רוח', emoji: '💨' },
  { id: 'none', label: 'ללא', emoji: '🔇' },
];

// Generate a noise buffer of given type
function generateNoiseBuffer(audioCtx: AudioContext, type: 'white' | 'brown' | 'pink'): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const bufferSize = 4 * sampleRate; // 4 seconds loop
  const buffer = audioCtx.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white;
      } else if (type === 'brown') {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.15;
        b6 = white * 0.115926;
      }
    }
  }
  return buffer;
}

interface AmbientHandle {
  stop: () => void;
}

function createAmbientSound(type: string, audioCtx: AudioContext): AmbientHandle {
  // Master gain with proper fade-in
  const masterGain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.5, now + 1.5);
  masterGain.connect(audioCtx.destination);

  const sources: AudioScheduledSourceNode[] = [];

  if (type === 'rain') {
    // Rain = brown noise filtered through highpass + slight modulation
    const buffer = generateNoiseBuffer(audioCtx, 'brown');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 600;
    hp.Q.value = 0.5;

    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 8000;

    source.connect(hp).connect(lp).connect(masterGain);
    source.start(0);
    sources.push(source);

    // Add a second layer - higher pitched rain drops
    const buffer2 = generateNoiseBuffer(audioCtx, 'white');
    const source2 = audioCtx.createBufferSource();
    source2.buffer = buffer2;
    source2.loop = true;

    const hp2 = audioCtx.createBiquadFilter();
    hp2.type = 'highpass';
    hp2.frequency.value = 4000;

    const dropsGain = audioCtx.createGain();
    dropsGain.gain.value = 0.15;

    source2.connect(hp2).connect(dropsGain).connect(masterGain);
    source2.start(0);
    sources.push(source2);

  } else if (type === 'ocean') {
    // Ocean = brown noise with LFO on filter frequency for wave effect
    const buffer = generateNoiseBuffer(audioCtx, 'brown');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    lp.Q.value = 0.7;

    // LFO modulates the filter cutoff for "wave" effect
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // slow wave
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start(0);
    sources.push(lfo);

    // Second LFO for volume swell
    const volLfo = audioCtx.createOscillator();
    volLfo.type = 'sine';
    volLfo.frequency.value = 0.08;
    const volLfoGain = audioCtx.createGain();
    volLfoGain.gain.value = 0.15;
    volLfo.connect(volLfoGain).connect(masterGain.gain);
    volLfo.start(0);
    sources.push(volLfo);

    source.connect(lp).connect(masterGain);
    source.start(0);
    sources.push(source);

  } else if (type === 'forest') {
    // Forest = pink noise (gentle) + soft bird-like tones
    const buffer = generateNoiseBuffer(audioCtx, 'pink');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.3;

    const forestGain = audioCtx.createGain();
    forestGain.gain.value = 0.7;

    source.connect(bp).connect(forestGain).connect(masterGain);
    source.start(0);
    sources.push(source);

    // Bird-like chirps using AM synthesis
    const birdOsc = audioCtx.createOscillator();
    birdOsc.type = 'sine';
    birdOsc.frequency.value = 2200;

    const birdAM = audioCtx.createOscillator();
    birdAM.type = 'sine';
    birdAM.frequency.value = 5;

    const birdAMGain = audioCtx.createGain();
    birdAMGain.gain.value = 0.04;

    const birdGain = audioCtx.createGain();
    birdGain.gain.value = 0;

    birdAM.connect(birdAMGain).connect(birdGain.gain);
    birdOsc.connect(birdGain).connect(masterGain);
    birdOsc.start(0);
    birdAM.start(0);
    sources.push(birdOsc, birdAM);

  } else if (type === 'wind') {
    // Wind = white noise with bandpass + slow LFO
    const buffer = generateNoiseBuffer(audioCtx, 'white');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.8;

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.06;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start(0);
    sources.push(lfo);

    // Volume modulation for wind gusts
    const gustLfo = audioCtx.createOscillator();
    gustLfo.type = 'sine';
    gustLfo.frequency.value = 0.1;
    const gustGain = audioCtx.createGain();
    gustGain.gain.value = 0.2;
    gustLfo.connect(gustGain).connect(masterGain.gain);
    gustLfo.start(0);
    sources.push(gustLfo);

    source.connect(bp).connect(masterGain);
    source.start(0);
    sources.push(source);
  }

  return {
    stop: () => {
      const t = audioCtx.currentTime;
      try {
        masterGain.gain.cancelScheduledValues(t);
        masterGain.gain.setValueAtTime(masterGain.gain.value, t);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      } catch { /* ignore */ }
      setTimeout(() => {
        sources.forEach(s => {
          try { s.stop(); } catch { /* already stopped */ }
          try { s.disconnect(); } catch { /* ok */ }
        });
        try { masterGain.disconnect(); } catch { /* ok */ }
      }, 900);
    },
  };
}

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
  const [selectedSound, setSelectedSound] = useState('rain');
  const startTime = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientHandle | null>(null);

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

  const startAmbient = useCallback(async (soundId: string) => {
    // Stop existing
    if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
    if (soundId === 'none') return;
    try {
      // Create or reuse AudioContext
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AC();
      }
      // Resume if suspended (required on iOS/mobile after user gesture)
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      ambientRef.current = createAmbientSound(soundId, audioCtxRef.current);
    } catch (err) {
      console.error('Audio error:', err);
    }
  }, []);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
  }, []);

  const start = () => {
    setIsActive(true);
    setIsComplete(false);
    setPhaseIndex(0);
    setTimer(4);
    setRound(1);
    startTime.current = Date.now();
    startAmbient(selectedSound);
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, tick]);

  // Stop ambient sound when exercise completes
  useEffect(() => {
    if (isComplete) {
      stopAmbient();
    }
  }, [isComplete, stopAmbient]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAmbient]);

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 24px 24px' }}>
        {!isActive && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '28px 24px',
              textAlign: 'center',
              borderRadius: '28px',
              background: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '12px', display: 'block' }}>self_improvement</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>נשימת קופסה</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6, fontSize: '0.85rem' }}>
              שאיפה 4 שניות ← עצירה 4 שניות <br /> נשיפה 4 שניות ← עצירה 4 שניות
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.8rem',
              marginBottom: '20px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>loop</span>
              {TOTAL_ROUNDS} סיבובים
            </div>
            {/* Ambient Sound Selector */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                🎵 צליל רקע מרגיע
              </p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {AMBIENT_SOUNDS.map(s => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSound(s.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: selectedSound === s.id ? '2px solid var(--primary)' : '1.5px solid #E5E7EB',
                      background: selectedSound === s.id ? 'rgba(42,25,230,0.08)' : 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: '50px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: selectedSound === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                    }}>{s.label}</span>
                  </motion.button>
                ))}
              </div>
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
            {/* Sound indicator */}
            {selectedSound !== 'none' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                <span>{AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.emoji}</span>
                <span>{AMBIENT_SOUNDS.find(s => s.id === selectedSound)?.label}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { stopAmbient(); setSelectedSound('none'); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'inherit',
                  }}
                >
                  🔇
                </motion.button>
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: selectedSound !== 'none' ? '16px' : '48px',
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
              onClick={() => { setIsActive(false); stopAmbient(); if (intervalRef.current) clearInterval(intervalRef.current); }}
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
