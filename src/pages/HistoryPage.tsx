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
          <span style={{ fontSize: '1.2rem' }}>📋</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>היסטוריה</h1>
        <div style={{ width: '44px' }}></div> {/* Spacer */}
      </div>

      <p style={{ color: '#666', fontSize: '1rem', marginBottom: '32px', textAlign: 'center' }}>
        {events.length} אירועים שתועדו עד כה
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner" />
        </div>
      ) : events.length === 0 ? (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📅</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>עדיין לא נרשמו אירועים</div>
          <p style={{ color: '#666', marginTop: '8px' }}>התיעודים שלך יופיעו כאן</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {events.map(event => (
            <div key={event.id} className="card" style={{
              background: 'white',
              borderRadius: '32px',
              padding: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: 0
            }}>
              <div style={{
                background: getIntensityColor(event.intensity),
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 900,
                color: 'white',
                boxShadow: `0 8px 20px ${getIntensityColor(event.intensity)}44`
              }}>
                {event.intensity}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>{formatDate(event.started_at)}</div>
                <div style={{ color: '#8E8E93', fontSize: '0.9rem', fontWeight: 700 }}>{formatTime(event.started_at)}</div>

                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {event.location_type && <span style={{ background: '#F5F5F9', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>📍 {event.location_type}</span>}
                  {event.sleep_hours !== null && <span style={{ background: '#F5F5F9', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>😴 {event.sleep_hours} ש׳</span>}
                </div>

                {event.notes && (
                  <div style={{
                    marginTop: '16px',
                    fontSize: '0.95rem',
                    color: '#4A4A4A',
                    background: '#F9F9FC',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    lineHeight: 1.5
                  }}>
                    {event.notes}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDeleteConfirm(event.id)}
                style={{ padding: '12px', color: '#BDBDBD', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ borderRadius: '32px', padding: '40px 32px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--emergency)', marginBottom: '12px' }}>מחיקת אירוע</div>
            <div style={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '32px' }}>האם אתה בטוח שברצונך למחוק אירוע זה? פעולה זו אינה הפיכה.</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '16px', fontWeight: 900 }} onClick={() => setDeleteConfirm(null)}>ביטול</button>
              <button className="btn" style={{ flex: 1, padding: '16px', background: 'var(--emergency)', color: 'white', borderRadius: '24px', fontWeight: 900 }} onClick={() => handleDelete(deleteConfirm)}>מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
