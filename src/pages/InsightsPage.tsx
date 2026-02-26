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
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="page-header" style={{ marginBottom: '24px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.4rem', fontWeight: 900, background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💡 תובנות AI</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>ניתוח דפוסים אישי בעזרת בינה מלאכותית</p>
      </div>

      <button className="btn btn-accent" onClick={handleGenerate} disabled={loading} style={{
        marginBottom: '32px',
        padding: '20px',
        fontSize: '1.2rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--accent), var(--primary))',
        boxShadow: '0 10px 30px var(--primary-glow)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%'
      }}>
        <Sparkles size={24} />
        {loading ? '⏳ הופך נתונים לתובנות...' : '✨ צור תובנות חדשות'}
      </button>

      {loading && insights.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', borderTopColor: 'var(--accent)' }} />
          <p style={{ marginTop: '20px', fontWeight: 700, color: 'var(--text-light)' }}>מעבד את ההיסטוריה שלך...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)', background: 'transparent' }}>
          <div className="empty-icon" style={{ fontSize: '5rem', marginBottom: '20px' }}>🧠</div>
          <div className="empty-text" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            עדיין אין מספיק נתונים.<br />
            רשום לפחות {MIN_EVENTS_FOR_ANALYSIS} אירועים בחודש האחרון כדי שנוכל למצוא דפוסים.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {insights.map(insight => (
            <div
              key={insight.id}
              className={`insight-card ${!insight.is_read ? 'unread' : ''}`}
              onClick={() => { if (!insight.is_read) markRead(insight.id); }}
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                background: insight.is_read ? 'white' : 'var(--accent-light)',
                border: '1px solid var(--border)',
                borderLeft: !insight.is_read ? '6px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.3s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="insight-category" style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px var(--primary-glow)'
                }}>
                  {insight.category || insight.insight_type}
                </div>
                <button className="delete-btn" onClick={e => { e.stopPropagation(); dismiss(insight.id); }} style={{ color: 'var(--text-light)', padding: '6px' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="insight-text" style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>{insight.insight_text}</div>
              <div className="insight-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📊 ביטחון: {insight.confidence ? getConfidenceLabel(insight.confidence) : 'לא ידוע'}</span>
                <span>{insight.events_analyzed} אירועים נותחו</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
