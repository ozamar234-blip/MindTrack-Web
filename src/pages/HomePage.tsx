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
    getEventCount(user.id, 7).then(setWeekCount).catch(() => { });
    getTodayCheckins(user.id).then(c => setHasCheckin(c.length > 0)).catch(() => { });
    getInsights(user.id, 50).then(insights => {
      setUnreadInsights(insights.filter(i => !i.is_read).length);
    }).catch(() => { });
  }, [user]);

  const displayName = profile?.display_name || 'משתמש';

  return (
    <div className="page" style={{ paddingBottom: '120px' }}>
      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '16px' }}>
        <p className="welcome-text" style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>{getGreeting()}</p>
        <h1 className="welcome-name" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{displayName} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px', opacity: 0.8 }}>איך אתה מרגיש היום?</p>
      </div>

      {/* Emergency / Log Event Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <button className="emergency-btn" onClick={() => navigate('/event-log')} style={{
          width: '180px',
          height: '180px',
          fontSize: '1.2rem',
          boxShadow: '0 12px 40px var(--emergency-glow), 0 0 0 8px rgba(255, 107, 107, 0.05)'
        }}>
          <span style={{ fontSize: '2.8rem', marginBottom: '8px' }}>🆘</span>
          רישום אירוע
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px', gap: '16px' }}>
        <div className="stat-card" style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem' }}>{weekCount}</div>
          <div className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>אירועים השבוע</div>
        </div>
        <div className="stat-card" style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem' }}>{hasCheckin ? '✅' : '➖'}</div>
          <div className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>צ׳ק-אין היום</div>
        </div>
        <div className="stat-card" style={{ padding: '24px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem' }}>{unreadInsights}</div>
          <div className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>תובנות חדשות</div>
        </div>
      </div>

      {/* Banners */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {unreadInsights > 0 && (
          <div className="banner banner-accent" onClick={() => navigate('/insights')} style={{ padding: '20px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg, var(--accent-light), #FFFFFF)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>יש לך {unreadInsights} תובנות חדשות!</span>
          </div>
        )}

        {!hasCheckin && (
          <div className="banner banner-primary" onClick={() => navigate('/checkin')} style={{ padding: '20px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg, var(--primary-light), #FFFFFF)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>עדיין לא מילאת צ׳ק-אין היום</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
        <div className="card-header" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span> פעולות מהירות
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, height: 'auto', flexDirection: 'column', padding: '16px 8px', borderRadius: 'var(--radius-sm)', gap: '8px', border: '1px solid var(--border)' }} onClick={() => navigate('/breathing')}>
            <Wind size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem' }}>נשימה</span>
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, height: 'auto', flexDirection: 'column', padding: '16px 8px', borderRadius: 'var(--radius-sm)', gap: '8px', border: '1px solid var(--border)' }} onClick={() => navigate('/dashboard')}>
            <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem' }}>דשבורד</span>
          </button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1, height: 'auto', flexDirection: 'column', padding: '16px 8px', borderRadius: 'var(--radius-sm)', gap: '8px', border: '1px solid var(--border)' }} onClick={() => navigate('/insights')}>
            <Brain size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem' }}>תובנות</span>
          </button>
        </div>
      </div>
    </div>
  );
}
