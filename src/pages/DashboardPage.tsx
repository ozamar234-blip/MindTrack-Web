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
      .catch(() => {})
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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">דשבורד 📊</h1>
      </div>

      {/* Period Filter */}
      <div className="period-filter">
        <button className={`period-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>שבוע</button>
        <button className={`period-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>חודש</button>
        <button className={`period-btn ${period === '3months' ? 'active' : ''}`} onClick={() => setPeriod('3months')}>3 חודשים</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalEvents}</div>
          <div className="stat-label">אירועים</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgIntensity}</div>
          <div className="stat-label">עוצמה ממוצעת</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgSleep}</div>
          <div className="stat-label">שעות שינה</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-text">אין מספיק נתונים לתקופה זו</div>
        </div>
      ) : (
        <>
          {/* Timeline Chart */}
          <div className="chart-container">
            <div className="chart-title">אירועים לאורך זמן</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4A90D9" strokeWidth={2} dot={{ r: 4 }} name="כמות" />
                <Line type="monotone" dataKey="avgIntensity" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} name="עוצמה" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Day of Week Chart */}
          <div className="chart-container">
            <div className="chart-title">אירועים לפי יום בשבוע</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#4A90D9" radius={[4, 4, 0, 0]} name="אירועים" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
