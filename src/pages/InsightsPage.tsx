import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInsights } from '../hooks/useInsights';
import { getConfidenceLabel } from '../utils/helpers';
import { MIN_EVENTS_FOR_ANALYSIS } from '../utils/constants';
import { Sparkles, X } from 'lucide-react';

export default function InsightsPage() {
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
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Header */}
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
          <span style={{ fontSize: '1.2rem' }}>💡</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>תובנות AI</h1>
        <div style={{ width: '44px' }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.5 }}>
          ניתוח דפוסים אישי בעזרת בינה מלאכותית
        </p>
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{
        marginBottom: '40px',
        padding: '24px',
        fontSize: '1.3rem',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, #7F13EC, #2A19E6)',
        color: 'white',
        boxShadow: '0 12px 32px rgba(127, 19, 236, 0.3)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        fontWeight: 900,
        cursor: 'pointer'
      }}>
        <Sparkles size={24} />
        {loading ? 'מייצר תובנות...' : 'צור תובנות חדשות'}
      </button>

      {loading && insights.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '24px', fontWeight: 800, color: '#333' }}>מעבד את ההיסטוריה שלך...</p>
        </div>
      ) : insights.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          borderRadius: '40px',
          background: 'rgba(255,255,255,0.5)',
          border: '2px dashed #E0E0E0'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🧠</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#333', lineHeight: 1.6 }}>
            עדיין אין מספיק נתונים.<br />
            רשום לפחות {MIN_EVENTS_FOR_ANALYSIS} אירועים בחודש האחרון כדי שנוכל למצוא דפוסים.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {insights.map(insight => (
            <div
              key={insight.id}
              onClick={() => { if (!insight.is_read) markRead(insight.id); }}
              style={{
                padding: '32px',
                borderRadius: '32px',
                background: insight.is_read ? 'white' : 'linear-gradient(135deg, #FDF7FF, #FFFFFF)',
                border: insight.is_read ? '1px solid #F0F0F0' : '2px solid #F3EFFF',
                boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 900
                }}>
                  {insight.category || insight.insight_type}
                </div>
                {!insight.is_read && (
                  <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }} />
                )}
              </div>

              <div style={{ fontSize: '1.2rem', lineHeight: 1.5, fontWeight: 800, color: 'black', marginBottom: '24px' }}>
                {insight.insight_text}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#8E8E93',
                fontWeight: 700,
                borderTop: '1px solid #F5F5F9',
                paddingTop: '20px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📊 ביטחון: {insight.confidence ? getConfidenceLabel(insight.confidence) : 'לא ידוע'}
                </span>
                <div onClick={e => { e.stopPropagation(); dismiss(insight.id); }} style={{ color: '#DDD', cursor: 'pointer' }}>
                  <X size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
