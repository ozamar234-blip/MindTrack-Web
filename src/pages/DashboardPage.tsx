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
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingTop: '8px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📊</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>לוח בקרה</h1>
        <div style={{ width: '44px' }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ color: '#666', fontSize: '1rem', fontWeight: 700 }}>
          סקירה של המצב הרגשי שלך
        </p>
      </div>

      {/* Period Filter */}
      <div style={{
        display: 'flex',
        background: '#EEE',
        padding: '4px',
        borderRadius: '24px',
        marginBottom: '32px',
        margin: '0 auto 32px auto',
        width: 'fit-content'
      }}>
        <button onClick={() => setPeriod('week')} style={{
          padding: '8px 20px',
          borderRadius: '20px',
          border: 'none',
          background: period === 'week' ? 'white' : 'transparent',
          color: period === 'week' ? 'black' : '#8E8E93',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: period === 'week' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
        }}>שבוע</button>
        <button onClick={() => setPeriod('month')} style={{
          padding: '8px 20px',
          borderRadius: '20px',
          border: 'none',
          background: period === 'month' ? 'white' : 'transparent',
          color: period === 'month' ? 'black' : '#8E8E93',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: period === 'month' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
        }}>חודש</button>
        <button onClick={() => setPeriod('3months')} style={{
          padding: '8px 20px',
          borderRadius: '20px',
          border: 'none',
          background: period === '3months' ? 'white' : 'transparent',
          color: period === '3months' ? 'black' : '#8E8E93',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: period === '3months' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
        }}>3 חוד׳</button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '20px 12px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>{totalEvents}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8E8E93' }}>אירועים</div>
        </div>
        <div style={{ background: 'white', borderRadius: '24px', padding: '20px 12px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FF7043', marginBottom: '4px' }}>{avgIntensity}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8E8E93' }}>עוצמה</div>
        </div>
        <div style={{ background: 'white', borderRadius: '24px', padding: '20px 12px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#26A69A', marginBottom: '4px' }}>{avgSleep}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8E8E93' }}>שינה</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '32px', border: '2px dashed #E0E0E0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '1.1rem', color: '#8E8E93', fontWeight: 800 }}>אין מספיק נתונים לתקופה זו</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Timeline Chart */}
          <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '32px' }}>אירועים לאורך זמן</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontWeight: 700 }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, stroke: 'white', strokeWidth: 2, fill: 'var(--primary)' }} name="כמות" />
                <Line type="monotone" dataKey="avgIntensity" stroke="#FF7043" strokeWidth={4} dot={{ r: 4, stroke: 'white', strokeWidth: 2, fill: '#FF7043' }} name="עוצמה" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Day of Week Chart */}
          <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '32px' }}>אירועים לפי יום</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="day" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontWeight: 700 }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#F5F5F9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} name="אירועים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
