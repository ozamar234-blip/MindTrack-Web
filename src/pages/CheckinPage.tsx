import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCheckins } from '../hooks/useCheckins';
import { MOOD_EMOJIS, INFLUENCE_OPTIONS } from '../utils/constants';

export default function CheckinPage() {
  const { user } = useAuth();
  const { createCheckin } = useCheckins(user?.id);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const checkinType = hour < 14 ? 'morning' : 'evening';

  const [mood, setMood] = useState(3);
  const [influences, setInfluences] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleInfluence = (value: string) => {
    setInfluences(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await createCheckin({
        checkin_type: checkinType,
        mood,
        energy_level: 3,
        sleep_quality: 3,
        sleep_hours: 7,
        stress_level: 3,
        physical_activity: influences.join(', '),
        notes,
      });
      navigate('/');
    } catch {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      flexDirection: 'column',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      overflow: 'hidden',
      background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f6f6f8 100%)',
    }}>
      {/* Top Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          paddingBottom: '8px',
          justifyContent: 'space-between',
        }}
      >
        <motion.div
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate('/')}
          style={{ display: 'flex', width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
        </motion.div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.3px', flex: 1, textAlign: 'center' }}>MindTrack</h2>
        <div style={{ display: 'flex', width: '48px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <motion.button
            whileTap={{ scale: 0.85 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', height: '48px', width: '48px', background: 'rgba(255,255,255,0.5)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>calendar_month</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 16px' }}>
        {/* Header Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px' }}>איך ההרגשה שלך?</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>קח רגע לעצמך ובדוק איך אתה מרגיש עכשיו</p>
        </motion.div>

        {/* Mood Selector */}
        <div className="no-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '16px', padding: '16px 0', justifyContent: 'center' }}>
          {MOOD_EMOJIS.map((m, i) => (
            <motion.div
              key={m.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '72px' }}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                onClick={() => setMood(m.value)}
                className="glass"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  boxShadow: mood === m.value ? '0 4px 16px rgba(42,25,230,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  outline: mood === m.value ? '2.5px solid var(--primary)' : 'none',
                  outlineOffset: '0px',
                  transition: 'box-shadow 0.2s, outline 0.2s',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
              </motion.div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: mood === m.value ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'color 0.2s',
              }}>{m.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Influences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginTop: '40px' }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>מה השפיע על מצב הרוח שלך היום?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {INFLUENCE_OPTIONS.map((opt, i) => {
              const isSelected = influences.includes(opt.value);
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleInfluence(opt.value)}
                  className="glass"
                  style={{
                    display: 'flex',
                    height: '44px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '16px',
                    padding: '0 20px',
                    border: isSelected ? '1px solid var(--primary)' : undefined,
                    background: isSelected ? 'rgba(42,25,230,0.1)' : undefined,
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border 0.2s, color 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{opt.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Journal Note Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ marginTop: '32px' }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px' }}>הערות נוספות (אופציונלי)</h3>
          <textarea
            className="glass"
            placeholder="איך עבר היום שלך?"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            style={{ width: '100%', borderRadius: '16px', padding: '16px', border: 'none', fontSize: '0.875rem', fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: '100px' }}
          />
        </motion.div>
      </main>

      {/* Fixed Bottom Button */}
      <div style={{ position: 'sticky', bottom: 0, padding: '16px', background: 'linear-gradient(to top, #f6f6f8 60%, transparent)' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            background: 'var(--primary)',
            color: 'white',
            padding: '16px',
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '1.125rem',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'שומר...' : 'שמור תיעוד'}
        </motion.button>
        <div style={{ height: '24px' }} />
      </div>
    </div>
  );
}
