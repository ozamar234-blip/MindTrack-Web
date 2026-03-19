import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { formatDate, formatTime, getIntensityColor } from '../utils/helpers';
import { Trash2 } from 'lucide-react';
import type { HealthEvent } from '../types';

function groupByDate(events: HealthEvent[]) {
  const groups: Record<string, HealthEvent[]> = {};
  events.forEach(e => {
    const dateKey = e.started_at.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(e);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'היום';
  if (dateStr === yesterday) return 'אתמול';
  return formatDate(dateStr + 'T00:00:00');
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { events, loading, fetchEvents, removeEvent } = useEvents(user?.id);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.trim().toLowerCase();
    return events.filter(e =>
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      (e.location_type && e.location_type.toLowerCase().includes(q))
    );
  }, [events, search]);

  const grouped = useMemo(() => groupByDate(filteredEvents), [filteredEvents]);

  const handleDelete = async (id: string) => {
    await removeEvent(id);
    setDeleteConfirm(null);
  };

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
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--primary)' }}>menu_book</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>היסטוריה</h1>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
          {events.length} אירועים
        </span>
      </motion.div>

      {/* Search */}
      <div style={{ padding: '0 24px 16px' }}>
        <div className="glass" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          borderRadius: '16px',
          height: '48px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-light)' }}>search</span>
          <input
            type="text"
            placeholder="חיפוש באירועים..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
            }}
          />
          {search && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-light)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
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
              {search ? 'search_off' : 'calendar_month'}
            </span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              {search ? 'לא נמצאו תוצאות' : 'עדיין לא נרשמו אירועים'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {search ? 'נסה לחפש מילה אחרת' : 'התיעודים שלך יופיעו כאן'}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {grouped.map(group => (
              <div key={group.date}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                  {getRelativeDateLabel(group.date)}
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-soft)' }} />
                  <span style={{ fontWeight: 500 }}>{group.items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <AnimatePresence>
                    {group.items.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          background: 'white',
                          borderRadius: '20px',
                          padding: '20px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                        }}
                      >
                        <div style={{
                          background: getIntensityColor(event.intensity),
                          width: '52px',
                          height: '52px',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          color: 'white',
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${getIntensityColor(event.intensity)}33`,
                        }}>
                          {event.intensity}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatTime(event.started_at)}</span>
                            {event.location_type && (
                              <span style={{
                                background: '#f1f5f9',
                                padding: '2px 10px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                              }}>
                                {event.location_type}
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <p style={{
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {event.notes}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {event.sleep_hours !== null && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bedtime</span>
                                {event.sleep_hours} ש׳
                              </span>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => setDeleteConfirm(event.id)}
                          style={{
                            padding: '8px',
                            color: 'var(--text-light)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            display: 'flex',
                          }}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '360px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px', display: 'block' }}>delete_forever</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>מחיקת אירוע</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                האם אתה בטוח? פעולה זו אינה הפיכה.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  ביטול
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  מחיקה
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
