import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getEventCount, getEvents } from '../api/events';
import { getInsights } from '../api/insights';
import { getTodayCheckins } from '../api/checkins';
import { MOOD_EMOJIS } from '../utils/constants';
import type { DailyCheckin, AIInsight } from '../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'לילה טוב';
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
}

function getMoodLabel(moodValue: number): string {
  const found = MOOD_EMOJIS.find(m => m.value === moodValue);
  return found ? found.label : '—';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours === 1 ? 'שעה' : `${hours} שעות`}`;
  const days = Math.floor(hours / 24);
  return `לפני ${days === 1 ? 'יום' : `${days} ימים`}`;
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diffDays) === 1) streak++;
    else break;
  }
  return streak;
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
};

export default function HomePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Real data states
  const [weekCount, setWeekCount] = useState<number | null>(null);
  const [prevWeekCount, setPrevWeekCount] = useState<number | null>(null);
  const [unreadInsights, setUnreadInsights] = useState<number | null>(null);
  const [todayInsightCount, setTodayInsightCount] = useState(0);
  const [latestCheckin, setLatestCheckin] = useState<DailyCheckin | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // Fetch all data in parallel
        const [count, prevCount, insights, checkins, events] = await Promise.allSettled([
          getEventCount(user.id, 7),
          getEventCount(user.id, 14),
          getInsights(user.id, 50),
          getTodayCheckins(user.id),
          getEvents(user.id, 90),
        ]);

        if (count.status === 'fulfilled') setWeekCount(count.value);
        if (prevCount.status === 'fulfilled' && count.status === 'fulfilled') {
          const prev = prevCount.value - count.value;
          setPrevWeekCount(prev);
        }
        if (insights.status === 'fulfilled') {
          const all = insights.value as AIInsight[];
          setUnreadInsights(all.filter(i => !i.is_read).length);
          const todayStr = new Date().toISOString().split('T')[0];
          setTodayInsightCount(all.filter(i => i.generated_at.startsWith(todayStr)).length);
        }
        if (checkins.status === 'fulfilled') {
          const today = checkins.value as DailyCheckin[];
          if (today.length > 0) {
            setLatestCheckin(today.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]);
          }
        }
        if (events.status === 'fulfilled') {
          const evts = events.value;
          const dates = evts.map(e => e.started_at || e.created_at);
          setStreak(calcStreak(dates));
        }
      } catch { /* silently handle */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const displayName = profile?.display_name || 'משתמש';

  // Calculate week-over-week trend
  const trendPercent = (weekCount !== null && prevWeekCount !== null && prevWeekCount > 0)
    ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100)
    : null;

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
          justifyContent: 'space-between',
        }}
      >
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          style={{
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
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
        </motion.button>
      </motion.div>

      {/* Main Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
        style={{ padding: '0 24px 16px' }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/event-log')}
          style={{
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
            fontFamily: 'inherit',
          }}
        >
          <span className="material-symbols-outlined fill-1" style={{ fontSize: '24px' }}>add_circle</span>
          <span>תיעוד אירוע</span>
        </motion.button>
      </motion.div>

      {/* Weekly Summary Section */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>סיכום שבועי</h3>
          <motion.span
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >הצג הכל</motion.span>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
        >
          {/* Stats Card — Records */}
          <motion.div variants={item} style={{
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
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {loading ? '—' : (weekCount ?? 0)}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>אירועים השבוע</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              {trendPercent !== null && trendPercent !== 0 ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: trendPercent > 0 ? '#059669' : '#ef4444' }}>
                    {trendPercent > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span style={{ marginRight: '4px', color: trendPercent > 0 ? '#059669' : '#ef4444' }}>
                    {trendPercent > 0 ? `${trendPercent}%+` : `${Math.abs(trendPercent)}%-`}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--text-light)' }}>
                  {loading ? '' : 'ללא שינוי'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Stats Card — Mood */}
          <motion.div variants={item} style={{
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
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {loading ? '—' : (latestCheckin ? getMoodLabel(latestCheckin.mood) : 'לא דווח')}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>סטטוס יומי</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
              <span style={{ marginRight: '4px' }}>
                {latestCheckin ? timeAgo(latestCheckin.created_at) : 'אין נתונים'}
              </span>
            </div>
          </motion.div>

          {/* Stats Card — Insights */}
          <motion.div variants={item} style={{
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
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {loading ? '—' : (unreadInsights ?? 0)}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>תובנות חדשות</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
              {todayInsightCount > 0 ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  <span style={{ marginRight: '4px' }}>{todayInsightCount} מהיום</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                  {loading ? '' : 'אין חדשות'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Stats Card — Streak */}
          <motion.div variants={item} style={{
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
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {loading ? '—' : (streak ?? 0)}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>ימי רצף</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', color: '#818cf8', fontSize: '0.75rem' }}>
              {streak !== null && streak > 0 ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_fire_department</span>
                  <span style={{ marginRight: '4px' }}>
                    {streak >= 3 ? 'מדהים! המשך כך' : 'התחלה טובה!'}
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--text-light)' }}>
                  {loading ? '' : 'התחל לתעד!'}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Quick Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ padding: '16px 24px' }}
      >
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
              {[
                { to: '/breathing', icon: 'air', label: 'נשימה' },
                { to: '/dashboard', icon: 'dashboard', label: 'לוח בקרה' },
                { to: '/insights', icon: 'psychology', label: 'תובנות' },
              ].map((action, i) => (
                <motion.button
                  key={action.to}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  onClick={() => navigate(action.to)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
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
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{action.icon}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {/* Decorative blurs */}
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '128px', height: '128px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '128px', height: '128px', background: 'rgba(42,25,230,0.1)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
        </div>
      </motion.div>
    </div>
  );
}
