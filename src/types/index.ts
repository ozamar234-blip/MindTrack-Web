export interface UserProfile {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  primary_condition: string | null;
  timezone: string;
  locale: string;
  onboarding_completed: boolean;
  notifications_enabled: boolean;
  morning_reminder_time: string;
  evening_reminder_time: string;
  created_at: string;
  updated_at: string;
}

export interface HealthEvent {
  id: string;
  user_id: string;
  event_type: string;
  intensity: number;
  pre_symptoms: string[];
  recent_food: string[];
  food_notes: string | null;
  location_type: string | null;
  location_lat: number | null;
  location_lng: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  notes: string | null;
  weather_temp: number | null;
  weather_condition: string | null;
  day_of_week: number;
  hour_of_day: number;
  duration_minutes: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  event_type: string;
  intensity: number;
  pre_symptoms: string[];
  recent_food: string[];
  food_notes: string;
  location_type: string;
  sleep_hours: number;
  stress_level: number;
  notes: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_type: 'morning' | 'evening';
  checkin_date: string;
  mood: number;
  energy_level: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  physical_activity: string | null;
  notes: string | null;
  created_at: string;
}

export interface CheckinFormData {
  checkin_type: 'morning' | 'evening';
  mood: number;
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  stress_level: number;
  physical_activity: string;
  notes: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_text: string;
  insight_type: string;
  category: string | null;
  confidence: number | null;
  data_start_date: string;
  data_end_date: string;
  events_analyzed: number;
  is_read: boolean;
  is_dismissed: boolean;
  generated_at: string;
  raw_analysis: Record<string, unknown> | null;
}

export interface SymptomOption {
  id: string;
  name_he: string;
  name_en: string;
  category: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface FoodOption {
  id: string;
  name_he: string;
  name_en: string;
  category: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface BreathingSession {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_seconds: number;
  completed: boolean;
  related_event_id: string | null;
  created_at: string;
}
