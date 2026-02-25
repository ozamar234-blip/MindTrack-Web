import { supabase } from './supabase';
import type { AIInsight, HealthEvent } from '../types';

interface CorrelationResult {
  type: string;
  description: string;
  confidence: number;
  category: string;
}

function analyzePatterns(events: HealthEvent[]): CorrelationResult[] {
  const correlations: CorrelationResult[] = [];
  if (events.length < 5) return correlations;

  // Sleep correlation
  const withSleep = events.filter(e => e.sleep_hours !== null);
  if (withSleep.length >= 3) {
    const avgSleep = withSleep.reduce((s, e) => s + (e.sleep_hours || 0), 0) / withSleep.length;
    const highIntensity = withSleep.filter(e => e.intensity >= 7);
    const highAvgSleep = highIntensity.length > 0 ? highIntensity.reduce((s, e) => s + (e.sleep_hours || 0), 0) / highIntensity.length : 0;
    if (highIntensity.length >= 2 && Math.abs(highAvgSleep - avgSleep) > 1) {
      correlations.push({
        type: 'sleep_correlation',
        description: highAvgSleep < avgSleep ? `אירועים חזקים קשורים לשינה מועטה (ממוצע ${highAvgSleep.toFixed(1)} שעות)` : `אירועים חזקים קשורים לשינה רבה (ממוצע ${highAvgSleep.toFixed(1)} שעות)`,
        confidence: Math.min(0.9, highIntensity.length / events.length + 0.3),
        category: 'שינה',
      });
    }
  }

  // Time of day
  const hourCounts: Record<string, number> = {};
  events.forEach(e => {
    const period = e.hour_of_day < 12 ? 'בוקר' : e.hour_of_day < 17 ? 'צהריים' : e.hour_of_day < 21 ? 'ערב' : 'לילה';
    hourCounts[period] = (hourCounts[period] || 0) + 1;
  });
  const maxPeriod = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxPeriod && maxPeriod[1] / events.length > 0.4) {
    correlations.push({
      type: 'time_correlation',
      description: `${Math.round(maxPeriod[1] / events.length * 100)}% מהאירועים שלך מתרחשים ב${maxPeriod[0]}`,
      confidence: maxPeriod[1] / events.length,
      category: 'זמן',
    });
  }

  // Stress correlation
  const withStress = events.filter(e => e.stress_level !== null);
  if (withStress.length >= 3) {
    const highStressEvents = withStress.filter(e => (e.stress_level || 0) >= 7);
    if (highStressEvents.length / withStress.length > 0.5) {
      const avgIntensityHigh = highStressEvents.reduce((s, e) => s + e.intensity, 0) / highStressEvents.length;
      correlations.push({
        type: 'stress_correlation',
        description: `ברמות לחץ גבוהות, עוצמת האירועים הממוצעת היא ${avgIntensityHigh.toFixed(1)}/10`,
        confidence: 0.75,
        category: 'לחץ',
      });
    }
  }

  // Food correlation
  const foodCounts: Record<string, { count: number; totalIntensity: number }> = {};
  events.forEach(e => {
    (e.recent_food || []).forEach(food => {
      if (!foodCounts[food]) foodCounts[food] = { count: 0, totalIntensity: 0 };
      foodCounts[food].count++;
      foodCounts[food].totalIntensity += e.intensity;
    });
  });
  Object.entries(foodCounts).filter(([, v]) => v.count >= 3).sort((a, b) => b[1].count - a[1].count).slice(0, 2).forEach(([food, data]) => {
    correlations.push({
      type: 'food_correlation',
      description: `"${food}" מופיע ב-${data.count} אירועים (עוצמה ממוצעת: ${(data.totalIntensity / data.count).toFixed(1)})`,
      confidence: Math.min(0.85, data.count / events.length + 0.2),
      category: 'תזונה',
    });
  });

  return correlations;
}

export async function saveInsights(userId: string, insights: CorrelationResult[], eventsCount: number): Promise<void> {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const insightRows = insights.map(insight => ({
    user_id: userId,
    insight_text: insight.description,
    insight_type: insight.type,
    category: insight.category,
    confidence: insight.confidence,
    data_start_date: startDate.toISOString().split('T')[0],
    data_end_date: now.toISOString().split('T')[0],
    events_analyzed: eventsCount,
    raw_analysis: insight,
  }));
  if (insightRows.length > 0) {
    const { error } = await supabase.from('ai_insights').insert(insightRows);
    if (error) throw error;
  }
}

export async function getInsights(userId: string, limit = 20): Promise<AIInsight[]> {
  const { data, error } = await supabase.from('ai_insights').select('*').eq('user_id', userId).eq('is_dismissed', false).order('generated_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markInsightRead(insightId: string): Promise<void> {
  const { error } = await supabase.from('ai_insights').update({ is_read: true }).eq('id', insightId);
  if (error) throw error;
}

export async function dismissInsight(insightId: string): Promise<void> {
  const { error } = await supabase.from('ai_insights').update({ is_dismissed: true }).eq('id', insightId);
  if (error) throw error;
}

export async function runFullAnalysis(userId: string): Promise<AIInsight[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: events } = await supabase.from('events').select('*').eq('user_id', userId).gte('started_at', thirtyDaysAgo.toISOString()).order('started_at', { ascending: false });
  if (!events || events.length < 5) return [];
  const correlations = analyzePatterns(events);
  if (correlations.length > 0) {
    await saveInsights(userId, correlations, events.length);
  }
  return getInsights(userId);
}
