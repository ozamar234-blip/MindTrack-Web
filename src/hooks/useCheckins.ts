import { useState, useCallback } from 'react';
import * as checkinsApi from '../api/checkins';
import type { DailyCheckin, CheckinFormData } from '../types';

export function useCheckins(userId: string | undefined) {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayCheckins = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await checkinsApi.getTodayCheckins(userId);
      setCheckins(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'שגיאה בטעינת צ\'ק-אין';
      setError(msg);
      console.error('fetchTodayCheckins error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createCheckin = useCallback(async (formData: CheckinFormData) => {
    if (!userId) return;
    setLoading(true);
    try {
      const newCheckin = await checkinsApi.createCheckin(userId, formData);
      setCheckins(prev => [...prev, newCheckin]);
      return newCheckin;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { checkins, loading, error, fetchTodayCheckins, createCheckin };
}
