import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useInsights } from '../hooks/useInsights';
import { getConfidenceLabel } from '../utils/helpers';
import { MIN_EVENTS_FOR_ANALYSIS } from '../utils/constants';
import { Sparkles, X, Brain } from 'lucide-react';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { insights, loading, fetchInsights, generateInsights, markRead, dismiss } = useInsights(user?.id);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleGenerate = async () => {
    try {
      const result = await generateInsights();
      if (!result || result.length === 0) {
        alert(`צריך לפחות ${MIN_EVENTS_FOR_ANALYSIS} אירועים בחודש האחרון כדי ליצור תובנות`);
      }
    } catch {
      alert('שגיאה ביצירת תובנות');
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
      paddingBottom: '96px',
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
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>psychology</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>תובנות AI</h1>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
          ניתוח דפוסים אישי
        </span>
      </motion.div>

      <div style={{ padding: '0 24px' }}>
        {/* Generate Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={loading}
          style={{
            marginBottom: '16px',
            padding: '18px',
            fontSize: '1.1rem',
            borderRadius: '20px',
            background: 'var(--primary)',
            color: 'white',
            boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Sparkles size={20} />
          {loading ? 'מייצר תובנות...' : 'צור תובנות חדשות'}
        </motion.button>

        {/* Deep AI Analysis CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/analysis')}
          className="glass"
          style={{
            marginBottom: '32px',
            padding: '16px',
            fontSize: '0.95rem',
            borderRadius: '16px',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            border: '1px solid rgba(42,25,230,0.1)',
          }}
        >
          <Brain size={20} />
          ניתוח AI מעמיק (7 ממדים)
        </motion.button>

        {/* Content */}
        {loading && insights.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--text-light)', marginBottom: '16px', display: 'block' }}>
              neurology
            </span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              עדיין אין מספיק נתונים
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              רשום לפחות {MIN_EVENTS_FOR_ANALYSIS} אירועים בחודש האחרון<br />כדי שנוכל למצוא דפוסים
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { if (!insight.is_read) markRead(insight.id); }}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: insight.is_read ? 'white' : 'linear-gradient(135deg, #FDF7FF, #FFFFFF)',
                    border: insight.is_read ? '1px solid #f1f5f9' : '2px solid rgba(42,25,230,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '4px 12px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {insight.category || insight.insight_type}
                    </span>
                    {!insight.is_read && (
                      <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                    )}
                  </div>

                  <p style={{ fontSize: '1rem', lineHeight: 1.6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {insight.insight_text}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-light)',
                    fontWeight: 600,
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>analytics</span>
                      ביטחון: {insight.confidence ? getConfidenceLabel(insight.confidence) : 'לא ידוע'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={e => { e.stopPropagation(); dismiss(insight.id); }}
                      style={{ color: 'var(--text-light)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: '4px' }}
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
