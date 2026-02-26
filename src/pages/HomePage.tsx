import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventCount } from '../api/events';
import { getTodayCheckins } from '../api/checkins';
import { getInsights } from '../api/insights';
import { Wind, BarChart3, Brain } from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'לילה טוב 🌙';
  if (hour < 12) return 'בוקר טוב ☀️';
  if (hour < 17) return 'צהריים טובים 🌤️';
  if (hour < 21) return 'ערב טוב 🌇';
  return 'לילה טוב 🌙';
}

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
      {/* Welcome */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <p className="welcome-text">{getGreeting()}</p>
        <h1 className="welcome-name">{displayName} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>איך אתה מרגיש היום?</p>
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
          <div className="stat-value" style={{ fontSize: hasCheckin ? '1.5rem' : '1.5rem' }}>{hasCheckin ? '✅' : '➖'}</div>
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
          <span>💡</span>
          <span style={{ fontWeight: 600 }}>יש לך {unreadInsights} תובנות חדשות!</span>
        </div>
      )}

      {!hasCheckin && (
        <div className="banner banner-primary" onClick={() => navigate('/checkin')}>
          <span>📋</span>
          <span style={{ fontWeight: 600 }}>עדיין לא מילאת צ׳ק-אין היום</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 8 }}>
        <div className="card-header">🎯 פעולות מהירות</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, borderRadius: 14 }} onClick={() => navigate('/breathing')}>
            <Wind size={18} /> נשימה
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, borderRadius: 14 }} onClick={() => navigate('/dashboard')}>
            <BarChart3 size={18} /> דשבורד
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, borderRadius: 14 }} onClick={() => navigate('/insights')}>
            <Brain size={18} /> תובנות
          </button>
        </div>
      </div>
    </div>
  );
}
