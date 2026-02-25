import { supabase } from './supabase';
import type { EventFormData, HealthEvent } from '../types';

export async function createEvent(userId: string, formData: EventFormData): Promise<HealthEvent> {
  const now = new Date();
  const { data, error } = await supabase.from('events').insert({
    user_id: userId,
    ...formData,
    day_of_week: now.getDay(),
    hour_of_day: now.getHours(),
    started_at: now.toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getEvents(userId: string, limit = 50): Promise<HealthEvent[]> {
  const { data, error } = await supabase.from('events').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<HealthEvent[]> {
  const { data, error } = await supabase.from('events').select('*').eq('user_id', userId).gte('started_at', startDate).lte('started_at', endDate).order('started_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getEventCount(userId: string, days = 7): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const { count, error } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('started_at', startDate.toISOString());
  if (error) throw error;
  return count || 0;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}
