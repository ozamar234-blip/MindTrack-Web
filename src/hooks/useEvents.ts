import { useState, useCallback } from 'react';
import * as eventsApi from '../api/events';
import type { HealthEvent, EventFormData } from '../types';

export function useEvents(userId: string | undefined) {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (limit = 50) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await eventsApi.getEvents(userId, limit);
      setEvents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createEvent = useCallback(async (formData: EventFormData) => {
    if (!userId) return;
    setLoading(true);
    try {
      const newEvent = await eventsApi.createEvent(userId, formData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const removeEvent = useCallback(async (eventId: string) => {
    try {
      await eventsApi.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה');
    }
  }, []);

  return { events, loading, error, fetchEvents, createEvent, removeEvent };
}
