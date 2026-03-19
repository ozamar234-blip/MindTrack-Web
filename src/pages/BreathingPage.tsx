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

function createAmbientSound(type: string, audioCtx: AudioContext): { nodes: AudioNode[]; stop: () => void } {
  const nodes: AudioNode[] = [];
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0;
  gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1);
  gainNode.connect(audioCtx.destination);
  nodes.push(gainNode);

  if (type === 'rain') {
    // Brown noise + filtered white noise for rain
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    nodes.push(source);
  } else if (type === 'ocean') {
    // Oscillator with LFO modulation for waves
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 0.1;
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.01 * white) / 1.01;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    // LFO for wave-like effect
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    noiseSource.connect(filter);
    filter.connect(gainNode);
    noiseSource.start();
    nodes.push(noiseSource, lfo);
  } else if (type === 'forest') {
    // Soft pink noise for forest ambience
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;
    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    nodes.push(source);
    // Add gentle bird-like chirps (high-freq sine blips)
    const chirpOsc = audioCtx.createOscillator();
    chirpOsc.type = 'sine';
    chirpOsc.frequency.value = 2800;
    const chirpGain = audioCtx.createGain();
    chirpGain.gain.value = 0;
    const chirpLfo = audioCtx.createOscillator();
    chirpLfo.frequency.value = 3;
    const chirpLfoGain = audioCtx.createGain();
    chirpLfoGain.gain.value = 0.03;
    chirpLfo.connect(chirpLfoGain);
    chirpLfoGain.connect(chirpGain.gain);
    chirpOsc.connect(chirpGain);
    chirpGain.connect(gainNode);
    chirpOsc.start();
    chirpLfo.start();
    nodes.push(chirpOsc, chirpLfo);
  } else if (type === 'wind') {
    // Filtered noise with slow modulation
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    nodes.push(source, lfo);
  }

  return {
    nodes,
    stop: () => {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        nodes.forEach(n => {
          try { (n as AudioScheduledSourceNode).stop?.(); } catch { /* already stopped */ }
          try { n.disconnect(); } catch { /* already disconnected */ }
        });
        gainNode.disconnect();
      }, 600);
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
  const ambientRef = useRef<{ stop: () => void } | null>(null);

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

  const startAmbient = useCallback((soundId: string) => {
    // Stop existing
    if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
    if (soundId === 'none') return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
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
            {/* Ambient Sound Selector */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                🎵 צליל רקע מרגיע
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {AMBIENT_SOUNDS.map(s => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSound(s.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: selectedSound === s.id ? '2px solid var(--primary)' : '1.5px solid #E5E7EB',
                      background: selectedSound === s.id ? 'rgba(42,25,230,0.08)' : 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      minWidth: '56px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{s.emoji}</span>
                    <span style={{
                      fontSize: '0.68rem',
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
