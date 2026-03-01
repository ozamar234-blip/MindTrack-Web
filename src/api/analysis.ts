import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import type { HealthEvent, DailyCheckin, AIAnalysisResponse } from '../types';

// ═══════════════════════════════════════════
// Analysis API – calls the Edge Function
// ═══════════════════════════════════════════

// Analysis trigger thresholds
export const ANALYSIS_CONFIG = {
  MIN_EVENTS: 5,
  MIN_DAYS: 7,
  DATA_WINDOW_DAYS: 30,
  MAX_FREQUENCY_DAYS: 7,
};

interface AnalysisResult {
  analysis: AIAnalysisResponse;
  usage: { input_tokens: number; output_tokens: number };
  generated_at: string;
}

// Prepare event data for analysis (minimize tokens)
function prepareEvents(events: HealthEvent[]) {
  return events.map(e => ({
    date: e.started_at,
    type: e.event_type,
    intensity: e.intensity,
    symptoms: e.pre_symptoms || [],
    food: e.recent_food || [],
    location: e.location_type,
    sleep_hours: e.sleep_hours,
    stress: e.stress_level,
    day: e.day_of_week,
    hour: e.hour_of_day,
    weather: e.weather_condition,
    notes: e.notes,
  }));
}

// Prepare checkin data for analysis
function prepareCheckins(checkins: DailyCheckin[]) {
  return checkins.map(c => ({
    date: c.checkin_date,
    type: c.checkin_type,
    mood: c.mood,
    energy: c.energy_level,
    sleep_quality: c.sleep_quality,
    sleep_hours: c.sleep_hours,
    stress: c.stress_level,
    activity: c.physical_activity,
  }));
}

// Run local statistical pre-analysis for correlations
function computeCorrelations(events: HealthEvent[]) {
  const correlations: { type: string; description: string; confidence: number; category: string }[] = [];
  if (events.length < 5) return correlations;

  // Sleep correlation
  const withSleep = events.filter(e => e.sleep_hours !== null);
  if (withSleep.length >= 3) {
    const avgSleep = withSleep.reduce((s, e) => s + (e.sleep_hours || 0), 0) / withSleep.length;
    const highIntensity = withSleep.filter(e => e.intensity >= 7);
    if (highIntensity.length >= 2) {
      const highAvgSleep = highIntensity.reduce((s, e) => s + (e.sleep_hours || 0), 0) / highIntensity.length;
      if (Math.abs(highAvgSleep - avgSleep) > 1) {
        correlations.push({
          type: 'sleep_correlation',
          description: `avg sleep on high-intensity events: ${highAvgSleep.toFixed(1)}h vs overall ${avgSleep.toFixed(1)}h`,
          confidence: Math.min(0.9, highIntensity.length / events.length + 0.3),
          category: 'sleep',
        });
      }
    }
  }

  // Time of day distribution
  const periods = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  events.forEach(e => {
    if (e.hour_of_day >= 6 && e.hour_of_day < 12) periods.morning++;
    else if (e.hour_of_day >= 12 && e.hour_of_day < 17) periods.afternoon++;
    else if (e.hour_of_day >= 17 && e.hour_of_day < 22) periods.evening++;
    else periods.night++;
  });
  const maxPeriod = Object.entries(periods).sort((a, b) => b[1] - a[1])[0];
  if (maxPeriod[1] / events.length > 0.4) {
    correlations.push({
      type: 'time_correlation',
      description: `${Math.round(maxPeriod[1] / events.length * 100)}% of events occur during ${maxPeriod[0]}`,
      confidence: maxPeriod[1] / events.length,
      category: 'time',
    });
  }

  // Day of week distribution
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  events.forEach(e => { dayCounts[e.day_of_week]++; });
  const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (dayCounts[maxDay] / events.length > 0.25) {
    correlations.push({
      type: 'day_correlation',
      description: `Peak day: ${dayNames[maxDay]} with ${dayCounts[maxDay]} events (${Math.round(dayCounts[maxDay] / events.length * 100)}%)`,
      confidence: 0.6,
      category: 'time',
    });
  }

  // Food frequency
  const foodCounts: Record<string, number> = {};
  events.forEach(e => {
    (e.recent_food || []).forEach(f => { foodCounts[f] = (foodCounts[f] || 0) + 1; });
  });
  Object.entries(foodCounts)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([food, count]) => {
      correlations.push({
        type: 'food_correlation',
        description: `"${food}" appears in ${count}/${events.length} events (${Math.round(count / events.length * 100)}%)`,
        confidence: Math.min(0.85, count / events.length + 0.2),
        category: 'food',
      });
    });

  return correlations;
}

// ═══════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════

export async function fetchAnalysisData(userId: string) {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - ANALYSIS_CONFIG.DATA_WINDOW_DAYS);

  const [eventsResult, checkinsResult] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', windowStart.toISOString())
      .order('started_at', { ascending: false }),
    supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('checkin_date', windowStart.toISOString().split('T')[0])
      .order('checkin_date', { ascending: false }),
  ]);

  const events = (eventsResult.data || []) as HealthEvent[];
  const checkins = (checkinsResult.data || []) as DailyCheckin[];

  return { events, checkins };
}

export async function runAIAnalysis(
  _userId: string,
  events: HealthEvent[],
  checkins: DailyCheckin[],
  primaryCondition: string,
  locale = 'he'
): Promise<AnalysisResult> {
  if (events.length < ANALYSIS_CONFIG.MIN_EVENTS) {
    throw new Error(`נדרשים לפחות ${ANALYSIS_CONFIG.MIN_EVENTS} אירועים. יש לך כרגע ${events.length}.`);
  }

  const correlations = computeCorrelations(events);

  const payload = {
    events: prepareEvents(events),
    checkins: prepareCheckins(checkins),
    correlations,
    locale,
    primary_condition: primaryCondition,
  };

  // Get the user's JWT for authorization
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || SUPABASE_ANON_KEY;

  // Use direct fetch instead of supabase.functions.invoke for better error handling
  const functionUrl = `${SUPABASE_URL}/functions/v1/analyze-health`;

  let response: Response;
  try {
    response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch (fetchError) {
    // Network-level error – give a clear Hebrew message
    const detail = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error('Edge Function fetch error:', detail);
    throw new Error(`שגיאת רשת בגישה לשרת הניתוח: ${detail}`);
  }

  // Read the response body
  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    const text = await response.text().catch(() => '');
    console.error('Edge Function non-JSON response:', response.status, text);
    throw new Error(`השרת החזיר תשובה לא תקינה (${response.status}). נסה שוב.`);
  }

  // Check for HTTP errors
  if (!response.ok) {
    const errMsg = (data?.error as string) || `שגיאת שרת (${response.status})`;
    throw new Error(errMsg);
  }

  if (data?.error) {
    throw new Error(data.error as string);
  }

  if (!data?.analysis || !(data.analysis as Record<string, unknown>)?.analysis_summary || !Array.isArray((data.analysis as Record<string, unknown>)?.key_insights)) {
    throw new Error('תגובה לא תקינה מהשרת. נסה שוב.');
  }

  return data as unknown as AnalysisResult;
}

// Save analysis result to ai_insights table for history
export async function saveAnalysisResult(
  userId: string,
  analysis: AIAnalysisResponse,
  eventsCount: number
): Promise<void> {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - ANALYSIS_CONFIG.DATA_WINDOW_DAYS);

  const { error } = await supabase.from('ai_insights').insert({
    user_id: userId,
    insight_text: analysis.analysis_summary?.trend_description || 'ניתוח AI מלא',
    insight_type: 'ai_full_analysis',
    category: 'full_analysis',
    confidence: 0.9,
    data_start_date: startDate.toISOString().split('T')[0],
    data_end_date: now.toISOString().split('T')[0],
    events_analyzed: eventsCount,
    is_read: false,
    is_dismissed: false,
    raw_analysis: analysis,
  });

  if (error) {
    console.error('Failed to save analysis:', error);
  }
}

// Get the last saved full analysis
export async function getLastAnalysis(userId: string): Promise<{ analysis: AIAnalysisResponse; generated_at: string } | null> {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('insight_type', 'ai_full_analysis')
    .order('generated_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  if (!row.raw_analysis) return null;

  return {
    analysis: row.raw_analysis as unknown as AIAnalysisResponse,
    generated_at: row.generated_at,
  };
}
