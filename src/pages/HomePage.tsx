import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventCount } from '../api/events';
import { getTodayCheckins } from '../api/checkins';
import { getInsights } from '../api/insights';
import { Wind, BarChart3, Brain } from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [weekCount, setWeekCount] = useState(0);
  const [hasCheckin, setHasCheckin] = useState(false);
  const [unreadInsights, setUnreadInsights] = useState(0);

  useEffect(() => {
    if (!user) return;
    getEventCount(user.id, 7).then(setWeekCount).catch(() => {});
    getTodayCheckins(user.id).then(c => setHasCheckin(c.length > 0)).catch(() => {});
    getInsights(user.id, 50).then(insights => {
      setUnreadInsights(insights.filter(i => !i.is_read).length);
    }).catch(() => {});
  }, [user]);

  const displayName = profile?.display_name || 'משתמש';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">שלום, {displayName} 👋</h1>
        <p className="page-subtitle">איך אתה מרגיש היום?</p>
      </div>

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={() => navigate('/event-log')}>
        <span style={{ fontSize: '2rem' }}>🆘</span>
        רישום אירוע
      </button>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{weekCount}</div>
          <div className="stat-label">אירועים השבוע</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{hasCheckin ? '✅' : '❌'}</div>
          <div className="stat-label">צ׳ק-אין היום</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{unreadInsights}</div>
          <div className="stat-label">תובנות חדשות</div>
        </div>
      </div>

      {/* Banners */}
      {unreadInsights > 0 && (
        <div className="banner banner-accent" onClick={() => navigate('/insights')}>
          <Brain size={20} />
          <span>יש לך {unreadInsights} תובנות חדשות! לחץ לצפייה</span>
        </div>
      )}

      {!hasCheckin && (
        <div className="banner banner-primary" onClick={() => navigate('/checkin')}>
          <span>📋</span>
          <span>עדיין לא מילאת צ׳ק-אין היום. לחץ למלא עכשיו</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">פעולות מהירות</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => navigate('/breathing')}>
            <Wind size={18} /> נשימה
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
            <BarChart3 size={18} /> דשבורד
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => navigate('/insights')}>
            <Brain size={18} /> תובנות
          </button>
        </div>
      </div>
    </div>
  );
}
