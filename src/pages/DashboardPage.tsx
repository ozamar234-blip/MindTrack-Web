import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEventsByDateRange } from '../api/events';
import type { HealthEvent } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDayName } from '../utils/helpers';

type Period = 'week' | 'month' | '3months';

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
      .map(d => ({ ...d, date: d.date.slice(5) })); // MM-DD
  })();

  // Day of week chart
  const dayData = (() => {
    const counts = Array(7).fill(0);
    events.forEach(e => { counts[e.day_of_week]++; });
    return counts.map((count, i) => ({ day: getDayName(i), count }));
  })();

  return (
    <div className="page" style={{ paddingBottom: '120px' }}>
      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>לוח בקרה 📊</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>סקירה של המצב הרגשי שלך</p>
      </div>

      {/* Period Filter */}
      <div className="period-filter" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        background: 'var(--primary-light)',
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        width: 'fit-content'
      }}>
        <button className={`period-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')} style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: period === 'week' ? 'white' : 'transparent',
          color: period === 'week' ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: period === 'week' ? 'var(--shadow-sm)' : 'none'
        }}>שבוע</button>
        <button className={`period-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')} style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: period === 'month' ? 'white' : 'transparent',
          color: period === 'month' ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: period === 'month' ? 'var(--shadow-sm)' : 'none'
        }}>חודש</button>
        <button className={`period-btn ${period === '3months' ? 'active' : ''}`} onClick={() => setPeriod('3months')} style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: period === '3months' ? 'white' : 'transparent',
          color: period === '3months' ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: period === '3months' ? 'var(--shadow-sm)' : 'none'
        }}>3 חודשים</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px', gap: '16px' }}>
        <div className="stat-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{totalEvents}</div>
          <div className="stat-label" style={{ fontWeight: 600 }}>אירועים</div>
        </div>
        <div className="stat-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem', color: 'var(--emergency)' }}>{avgIntensity}</div>
          <div className="stat-label" style={{ fontWeight: 600 }}>עוצמה</div>
        </div>
        <div className="stat-card" style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="stat-value" style={{ fontSize: '2.2rem', color: 'var(--accent)' }}>{avgSleep}</div>
          <div className="stat-label" style={{ fontWeight: 600 }}>שינה (ש׳)</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : events.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)' }}>
          <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
          <div className="empty-text" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>אין מספיק נתונים לתקופה זו</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Timeline Chart */}
          <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)' }}>
            <div className="chart-title" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px' }}>אירועים לאורך זמן</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)' }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, stroke: 'white', strokeWidth: 2, fill: 'var(--primary)' }} name="כמות" />
                <Line type="monotone" dataKey="avgIntensity" stroke="var(--emergency)" strokeWidth={4} dot={{ r: 4, stroke: 'white', strokeWidth: 2, fill: 'var(--emergency)' }} name="עוצמה" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Day of Week Chart */}
          <div className="card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-md)' }}>
            <div className="chart-title" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px' }}>אירועים לפי יום בשבוע</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="day" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)' }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)' }} />
                <Tooltip cursor={{ fill: 'var(--primary-light)', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} name="אירועים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
