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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">תובנות AI 🧠</h1>
        <p className="page-subtitle">ניתוח דפוסים והתאמות אישיות</p>
      </div>

      <button className="btn btn-accent" onClick={handleGenerate} disabled={loading} style={{ marginBottom: 20 }}>
        <Sparkles size={18} />
        {loading ? 'מנתח...' : 'צור תובנות חדשות'}
      </button>

      {loading && insights.length === 0 ? (
        <div className="spinner" />
      ) : insights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">
            עדיין אין תובנות. רשום לפחות {MIN_EVENTS_FOR_ANALYSIS} אירועים כדי לקבל ניתוח ראשון.
          </div>
        </div>
      ) : (
        insights.map(insight => (
          <div
            key={insight.id}
            className={`insight-card ${!insight.is_read ? 'unread' : ''}`}
            onClick={() => { if (!insight.is_read) markRead(insight.id); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="insight-category">{insight.category || insight.insight_type}</div>
              <button className="delete-btn" onClick={e => { e.stopPropagation(); dismiss(insight.id); }} title="הסתר">
                <X size={16} />
              </button>
            </div>
            <div className="insight-text">{insight.insight_text}</div>
            <div className="insight-meta">
              <span>ביטחון: {insight.confidence ? getConfidenceLabel(insight.confidence) : 'לא ידוע'}</span>
              <span>{insight.events_analyzed} אירועים נותחו</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
