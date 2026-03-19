import { useState, useCallback } from 'react';
import * as insightsApi from '../api/insights';
import type { AIInsight } from '../types';

export function useInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await insightsApi.getInsights(userId);
      setInsights(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'שגיאה בטעינת תובנות';
      setError(msg);
      console.error('fetchInsights error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const generateInsights = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await insightsApi.runFullAnalysis(userId);
      setInsights(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שגיאה ביצירת תובנות';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    await insightsApi.markInsightRead(id);
    setInsights(prev => prev.map(i => i.id === id ? { ...i, is_read: true } : i));
  }, []);

  const dismiss = useCallback(async (id: string) => {
    await insightsApi.dismissInsight(id);
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  return { insights, loading, error, fetchInsights, generateInsights, markRead, dismiss };
}
