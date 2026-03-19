import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getEventsByDateRange } from '../api/events';
import type { HealthEvent } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDayName } from '../utils/helpers';

type Period = 'week' | 'month' | '3months';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'week', label: 'שבוע' },
  { value: 'month', label: 'חודש' },
  { value: '3months', label: '3 חוד׳' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else startDate.setMonth(startDate.getMonth() - 3);

    getEventsByDateRange(user.id, startDate.toISOString(), endDate.toISOString())
      .then(setEvents)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user, period]);

  // Stats
  const totalEvents = events.length;
  const avgIntensity = totalEvents > 0 ? (events.reduce((s, e) => s + e.intensity, 0) / totalEvents).toFixed(1) : '0';
  const avgSleep = (() => {
    const withSleep = events.filter(e => e.sleep_hours !== null);
    return withSleep.length > 0 ? (withSleep.reduce((s, e) => s + (e.sleep_hours || 0), 0) / withSleep.length).toFixed(1) : '0';
  })();

  // Timeline chart data
  const timelineData = (() => {
    const map: Record<string, { date: string; count: number; avgIntensity: number; total: number }> = {};
    events.forEach(e => {
      const date = e.started_at.split('T')[0];
      if (!map[date]) map[date] = { date, count: 0, avgIntensity: 0, total: 0 };
      map[date].count++;
      map[date].total += e.intensity;
    });
    return Object.values(map)
      .map(d => ({ ...d, avgIntensity: +(d.total / d.count).toFixed(1) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, date: d.date.slice(5) }));
  })();

  // Day of week chart
  const dayData = (() => {
    const counts = Array(7).fill(0);
    events.forEach(e => { counts[e.day_of_week]++; });
    return counts.map((count, i) => ({ day: getDayName(i), count }));
  })();

  const stats = [
    { label: 'אירועים', value: totalEvents, color: 'var(--primary)', icon: 'event_note' },
    { label: 'עוצמה ממוצעת', value: avgIntensity, color: '#f59e0b', icon: 'speed' },
    { label: 'שינה ממוצעת', value: avgSleep, color: '#10b981', icon: 'bedtime' },
  ];

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
      paddingBottom: '120px',
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
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>לוח בקרה</h1>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
          סקירת מצב רגשי
        </span>
      </motion.div>

      <div style={{ padding: '0 24px' }}>
        {/* Period Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: period === opt.value ? 'white' : 'transparent',
                color: period === opt.value ? 'var(--text-primary)' : 'var(--text-light)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: period === opt.value ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {stats.map(stat => (
            <div key={stat.label} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: stat.color, marginBottom: '4px', display: 'block' }}>
                {stat.icon}
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>
                {loading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ height: '280px', borderRadius: '20px' }} />
            <div className="skeleton" style={{ height: '260px', borderRadius: '20px' }} />
          </div>
        ) : events.length === 0 ? (
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
              bar_chart
            </span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>אין מספיק נתונים</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>תעד אירועים כדי לראות סטטיסטיקות</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Timeline Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>timeline</span>
                אירועים לאורך זמן
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '0.85rem' }} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3, stroke: 'white', strokeWidth: 2, fill: 'var(--primary)' }} name="כמות" />
                  <Line type="monotone" dataKey="avgIntensity" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3, stroke: 'white', strokeWidth: 2, fill: '#f59e0b' }} name="עוצמה" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Day of Week Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>calendar_view_week</span>
                אירועים לפי יום
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="day" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: 'rgba(42,25,230,0.04)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontWeight: 600, fontSize: '0.85rem' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} name="אירועים" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
