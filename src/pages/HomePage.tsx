import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventCount } from '../api/events';
import { getInsights } from '../api/insights';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'לילה טוב';
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
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
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '24px',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(42,25,230,0.2), #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary)' }}>person</span>
          </div>
          <div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontWeight: 500 }}>{getGreeting()},</p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.3px' }}>שלום, {displayName}</h2>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{
            display: 'flex',
            width: '40px',
            height: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
          </button>
        </div>
      </div>

      {/* Main Action Button */}
      <div style={{ padding: '0 24px 16px' }}>
        <button onClick={() => navigate('/event-log')} style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--primary)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.125rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 30px -10px rgba(42, 25, 230, 0.5)',
          transition: 'transform 0.15s ease',
          fontFamily: 'inherit',
        }}>
          <span className="material-symbols-outlined fill-1" style={{ fontSize: '24px' }}>add_circle</span>
          <span>תיעוד אירוע</span>
        </button>
      </div>

      {/* Weekly Summary Section */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>סיכום שבועי</h3>
          <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>הצג הכל</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}>
          {/* Stats Card — Records */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>event_note</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>תיעודים</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{weekCount}</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>אירועים השבוע</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
              <span style={{ marginRight: '4px' }}>20%+</span>
            </div>
          </div>

          {/* Stats Card — Mood */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mood</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>מצב רוח</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>מצוין</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>סטטוס יומי</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
              <span style={{ marginRight: '4px' }}>עודכן לפני שעה</span>
            </div>
          </div>

          {/* Stats Card — Insights */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lightbulb</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>תובנות</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{unreadInsights}</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>תובנות חדשות</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span style={{ marginRight: '4px' }}>1 מהיום</span>
            </div>
          </div>

          {/* Stats Card — Streak */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>רצף</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>5</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>ימי רצף</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: '#818cf8', fontSize: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>stars</span>
              <span style={{ marginRight: '4px' }}>שיא אישי: 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{
          background: 'linear-gradient(to right, #e0e7ff, #ecfdf5)',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>פעולות מהירות</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => navigate('/breathing')} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <div className="glass" style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>air</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>נשימה</span>
              </button>

              <button onClick={() => navigate('/dashboard')} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <div className="glass" style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>dashboard</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>לוח בקרה</span>
              </button>

              <button onClick={() => navigate('/insights')} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                <div className="glass" style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>psychology</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>תובנות</span>
              </button>
            </div>
          </div>
          {/* Decorative blurs */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '-40px',
            width: '128px',
            height: '128px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-40px',
            width: '128px',
            height: '128px',
            background: 'rgba(42,25,230,0.1)',
            borderRadius: '50%',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  );
}
