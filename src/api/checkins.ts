import { supabase } from './supabase';
import type { CheckinFormData, DailyCheckin } from '../types';

export async function createCheckin(userId: string, formData: CheckinFormData): Promise<DailyCheckin> {
  const { data, error } = await supabase.from('daily_checkins').insert({
    user_id: userId,
    ...formData,
    checkin_date: new Date().toISOString().split('T')[0],
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getTodayCheckins(userId: string): Promise<DailyCheckin[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase.from('daily_checkins').select('*').eq('user_id', userId).eq('checkin_date', today);
  if (error) throw error;
  return data || [];
}

export async function getCheckinsByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyCheckin[]> {
  const { data, error } = await supabase.from('daily_checkins').select('*').eq('user_id', userId).gte('checkin_date', startDate).lte('checkin_date', endDate).order('checkin_date', { ascending: false });
  if (error) throw error;
  return data || [];
}
