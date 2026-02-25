import { useState, useCallback } from 'react';
import * as insightsApi from '../api/insights';
import type { AIInsight } from '../types';

export function useInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await insightsApi.getInsights(userId);
      setInsights(data);
    } catch { /* silent */ } finally {
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

  return { insights, loading, fetchInsights, generateInsights, markRead, dismiss };
}
