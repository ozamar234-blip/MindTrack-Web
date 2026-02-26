import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { formatDate, formatTime, getIntensityColor } from '../utils/helpers';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const { events, loading, fetchEvents, removeEvent } = useEvents(user?.id);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    await removeEvent(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'right' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: 800 }}>היסטוריה 📋</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>{events.length} אירועים שתועדו עד כה</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner" />
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ fontSize: '5rem', marginBottom: '20px' }}>📅</div>
          <div className="empty-text" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>עדיין לא נרשמו אירועים</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map(event => (
            <div key={event.id} className="event-item" style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: '1px solid var(--border)'
            }}>
              <div className="event-intensity" style={{
                background: getIntensityColor(event.intensity),
                width: '50px',
                height: '50px',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: 'white',
                boxShadow: `0 8px 15px ${getIntensityColor(event.intensity)}44`
              }}>
                {event.intensity}
              </div>
              <div className="event-details" style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{formatDate(event.started_at)}</div>
                <div className="event-time" style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600 }}>{formatTime(event.started_at)}</div>
                <div className="event-tags" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {event.location_type && <span className="event-tag" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>📍 {event.location_type}</span>}
                  {event.sleep_hours !== null && <span className="event-tag" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>😴 {event.sleep_hours} ש׳</span>}
                  {event.stress_level !== null && <span className="event-tag" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>😫 לחץ: {event.stress_level}</span>}
                </div>
                {event.notes && <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: '8px' }}>{event.notes}</div>}
              </div>
              <button className="delete-btn" onClick={() => setDeleteConfirm(event.id)} style={{ padding: '10px', color: 'var(--emergency)', background: 'transparent' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ borderRadius: 'var(--radius-lg)', padding: '32px' }}>
            <div className="dialog-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emergency)' }}>מחיקת אירוע</div>
            <div className="dialog-text" style={{ margin: '16px 0 32px', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>האם אתה בטוח שברצונך למחוק אירוע זה? לא ניתן לשחזר.</div>
            <div className="dialog-actions" style={{ gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '14px' }} onClick={() => setDeleteConfirm(null)}>ביטול</button>
              <button className="btn btn-emergency" style={{ flex: 1, padding: '14px' }} onClick={() => handleDelete(deleteConfirm)}>מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
