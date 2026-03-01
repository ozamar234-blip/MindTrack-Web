import { useState, useCallback, useEffect, useRef } from 'react';
import * as analysisApi from '../api/analysis';
import type { AIAnalysisResponse, HealthEvent, DailyCheckin } from '../types';

const PROGRESS_MESSAGES = [
  'מאסף את הנתונים שלך...',
  'מנתח דפוסי שינה...',
  'בודק קשרי תזונה...',
  'מחפש דפוסי זמן...',
  'מזהה סימפטומים מקדימים...',
  'מחשב קורלציות צולבות...',
  'בונה משוואות טריגר...',
  'מסכם ממצאים חיוביים...',
  'מכין את הדוח שלך...',
];

interface UseAnalysisReturn {
  analysis: AIAnalysisResponse | null;
  events: HealthEvent[];
  checkins: DailyCheckin[];
  loading: boolean;
  loadingPrevious: boolean;
  error: string | null;
  progressMessage: string;
  lastAnalyzedAt: string | null;
  runAnalysis: () => Promise<void>;
  hasEnoughData: boolean;
  eventCount: number;
}

export function useAnalysis(userId: string | undefined, primaryCondition: string | null): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState(PROGRESS_MESSAGES[0]);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load previous analysis and current data on mount
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoadingPrevious(true);
      try {
        const [dataResult, lastResult] = await Promise.all([
          analysisApi.fetchAnalysisData(userId),
          analysisApi.getLastAnalysis(userId),
        ]);

        setEvents(dataResult.events);
        setCheckins(dataResult.checkins);

        if (lastResult) {
          setAnalysis(lastResult.analysis);
          setLastAnalyzedAt(lastResult.generated_at);
        }
      } catch {
        // Silent – just means no previous analysis
      } finally {
        setLoadingPrevious(false);
      }
    };

    loadData();
  }, [userId]);

  // Progress message cycling during analysis
  const startProgress = useCallback(() => {
    let idx = 0;
    setProgressMessage(PROGRESS_MESSAGES[0]);
    progressInterval.current = setInterval(() => {
      idx = (idx + 1) % PROGRESS_MESSAGES.length;
      setProgressMessage(PROGRESS_MESSAGES[idx]);
    }, 2500);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    startProgress();

    try {
      // Refresh data first
      const freshData = await analysisApi.fetchAnalysisData(userId);
      setEvents(freshData.events);
      setCheckins(freshData.checkins);

      if (freshData.events.length < analysisApi.ANALYSIS_CONFIG.MIN_EVENTS) {
        throw new Error(`נדרשים לפחות ${analysisApi.ANALYSIS_CONFIG.MIN_EVENTS} אירועים. יש לך כרגע ${freshData.events.length}.`);
      }

      const result = await analysisApi.runAIAnalysis(
        userId,
        freshData.events,
        freshData.checkins,
        primaryCondition || 'לא צוין',
        'he'
      );

      setAnalysis(result.analysis);
      setLastAnalyzedAt(result.generated_at);

      // Save to DB in background
      analysisApi.saveAnalysisResult(userId, result.analysis, freshData.events.length).catch(() => {});

    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בלתי צפויה בניתוח');
    } finally {
      setLoading(false);
      stopProgress();
    }
  }, [userId, primaryCondition, startProgress, stopProgress]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => stopProgress();
  }, [stopProgress]);

  const hasEnoughData = events.length >= analysisApi.ANALYSIS_CONFIG.MIN_EVENTS;

  return {
    analysis,
    events,
    checkins,
    loading,
    loadingPrevious,
    error,
    progressMessage,
    lastAnalyzedAt,
    runAnalysis,
    hasEnoughData,
    eventCount: events.length,
  };
}
