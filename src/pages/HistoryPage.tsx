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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">היסטוריה 📋</h1>
        <p className="page-subtitle">{events.length} אירועים</p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">עדיין לא נרשמו אירועים</div>
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className="event-item">
            <div className="event-intensity" style={{ background: getIntensityColor(event.intensity) }}>
              {event.intensity}
            </div>
            <div className="event-details">
              <div style={{ fontWeight: 600 }}>{formatDate(event.started_at)}</div>
              <div className="event-time">{formatTime(event.started_at)}</div>
              <div className="event-tags">
                {event.location_type && <span className="event-tag">📍 {event.location_type}</span>}
                {event.sleep_hours !== null && <span className="event-tag">😴 {event.sleep_hours}h</span>}
                {event.stress_level !== null && <span className="event-tag">😰 לחץ: {event.stress_level}</span>}
                {(event.pre_symptoms || []).slice(0, 2).map(s => (
                  <span key={s} className="event-tag">{s}</span>
                ))}
              </div>
              {event.notes && <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#636E72' }}>{event.notes}</div>}
            </div>
            <button className="delete-btn" onClick={() => setDeleteConfirm(event.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-title">מחיקת אירוע</div>
            <div className="dialog-text">האם אתה בטוח שברצונך למחוק אירוע זה? לא ניתן לשחזר.</div>
            <div className="dialog-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirm(null)}>ביטול</button>
              <button className="btn btn-emergency btn-sm" onClick={() => handleDelete(deleteConfirm)}>מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
