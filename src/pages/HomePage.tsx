import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventCount } from '../api/events';
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
  const [unreadInsights, setUnreadInsights] = useState(0);

  useEffect(() => {
    if (!user) return;
    getEventCount(user.id, 7).then(setWeekCount).catch(() => { });
    getInsights(user.id, 50).then(insights => {
      setUnreadInsights(insights.filter(i => !i.is_read).length);
    }).catch(() => { });
  }, [user]);

  const displayName = profile?.display_name || 'משתמש';

  return (
    <div className="page" style={{ paddingBottom: '120px' }}>
      {/* Header with User Profile */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingTop: '8px'
      }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{getGreeting()},</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>שלום, {displayName}</h1>
        </div>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD6C1, #FFB997)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          border: '2px solid white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>👤</div>
      </div>

      {/* Main Action Button */}
      <button className="btn" onClick={() => navigate('/event-log')} style={{
        background: 'var(--secondary)',
        color: 'white',
        borderRadius: '32px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '1.3rem',
        fontWeight: 900,
        boxShadow: '0 12px 32px rgba(42, 25, 230, 0.3)',
        marginBottom: '40px',
        width: '100%'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--secondary)',
          fontSize: '1.5rem'
        }}>+</div>
        תיעוד אירוע
      </button>

      {/* Features Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>סיכום שבועי</h2>
          <button className="btn-ghost" style={{ fontSize: '0.9rem', fontWeight: 700, padding: '4px 8px' }}>הצג הכל</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Mood Card */}
          <div className="card" style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.2rem' }}>😊</span>
              <span style={{ color: '#00C9A7', fontWeight: 700, fontSize: '0.85rem' }}>מצב רוח</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>מצוין</div>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>סטטוס יומי</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: '#8E8E93', fontSize: '0.75rem' }}>
              <span>🕒</span> עודכן לפני שעה
            </div>
          </div>

          {/* Records Card */}
          <div className="card" style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.2rem' }}>📅</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem' }}>תיעודים</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>{weekCount}</div>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>אירועים השבוע</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: '#00C9A7', fontSize: '0.75rem', fontWeight: 700 }}>
              📈 +20%
            </div>
          </div>

          {/* Stress Card */}
          <div className="card" style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem' }}>רעף</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>5</div>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>ימי רצף</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: 'var(--secondary)', fontSize: '0.75rem' }}>
              ⭐ שיא אישי: 12
            </div>
          </div>

          {/* Insights Card */}
          <div className="card" style={{ padding: '24px', borderRadius: '32px', marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <span style={{ color: '#FFA500', fontWeight: 700, fontSize: '0.85rem' }}>תובנות</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' }}>{unreadInsights}</div>
              <p style={{ color: '#666', fontSize: '0.75rem' }}>תובנות חדשות</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700 }}>
              + 1 מהיום
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #E0E8FF, #F3F6FF)',
        borderRadius: '32px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '20px', textAlign: 'center' }}>פעולות מהירות</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }} onClick={() => navigate('/breathing')}>
            <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Wind size={24} color="var(--secondary)" />
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>נשימה</p>
          </div>
          <div style={{ textAlign: 'center' }} onClick={() => navigate('/dashboard')}>
            <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <BarChart3 size={24} color="var(--secondary)" />
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>לוח בקרה</p>
          </div>
          <div style={{ textAlign: 'center' }} onClick={() => navigate('/insights')}>
            <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Brain size={24} color="var(--secondary)" />
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>תובנות</p>
          </div>
        </div>
      </div>
    </div>
  );
}
