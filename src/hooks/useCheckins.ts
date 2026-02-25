import { useState, useCallback } from 'react';
import * as checkinsApi from '../api/checkins';
import type { DailyCheckin, CheckinFormData } from '../types';

export function useCheckins(userId: string | undefined) {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayCheckins = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await checkinsApi.getTodayCheckins(userId);
      setCheckins(data);
    } catch { /* silent */ } finally {
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

  return { checkins, loading, fetchTodayCheckins, createCheckin };
}
