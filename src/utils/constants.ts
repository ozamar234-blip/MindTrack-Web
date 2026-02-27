export const MOOD_EMOJIS = [
  { value: 5, emoji: '🤩', label: 'שמח מאוד' },
  { value: 4, emoji: '😊', label: 'שמח' },
  { value: 3, emoji: '😐', label: 'ניטרלי' },
  { value: 2, emoji: '😔', label: 'עצוב' },
  { value: 1, emoji: '😢', label: 'עצוב מאוד' },
];

export const INFLUENCE_OPTIONS = [
  { value: 'sleep', label: 'שינה', icon: 'bedtime' },
  { value: 'work', label: 'עבודה', icon: 'work' },
  { value: 'family', label: 'משפחה', icon: 'groups' },
  { value: 'exercise', label: 'פעילות גופנית', icon: 'fitness_center' },
  { value: 'nutrition', label: 'תזונה', icon: 'restaurant' },
  { value: 'relationship', label: 'זוגיות', icon: 'favorite' },
  { value: 'other', label: 'אחר', icon: 'add' },
];

export const LOCATION_OPTIONS = [
  { value: 'home', label: 'בית', icon: '🏠' },
  { value: 'work', label: 'עבודה', icon: '💼' },
  { value: 'school', label: 'לימודים', icon: '🎓' },
  { value: 'outside', label: 'בחוץ', icon: '🌳' },
  { value: 'transport', label: 'תחבורה', icon: '🚗' },
  { value: 'other', label: 'אחר', icon: '📍' },
];

export const ACTIVITY_OPTIONS = [
  { value: 'walking', label: 'הליכה', icon: '🚶' },
  { value: 'running', label: 'ריצה', icon: '🏃' },
  { value: 'gym', label: 'חדר כושר', icon: '🏋️' },
  { value: 'yoga', label: 'יוגה', icon: '🧘' },
  { value: 'swimming', label: 'שחייה', icon: '🏊' },
  { value: 'cycling', label: 'רכיבה', icon: '🚴' },
  { value: 'none', label: 'ללא', icon: '🚫' },
];

export const DEFAULT_SYMPTOMS = [
  { id: 'anxiety', name_he: 'חרדה', icon: '' },
  { id: 'panic', name_he: 'פניקה', icon: '' },
  { id: 'headache', name_he: 'כאב ראש', icon: '' },
  { id: 'fatigue', name_he: 'עייפות', icon: '' },
  { id: 'chest', name_he: 'לחץ בחזה', icon: '' },
  { id: 'dizziness', name_he: 'סחרחורת', icon: '' },
];

export const MIN_EVENTS_FOR_ANALYSIS = 5;

export const DISCLAIMER_HE = 'אפליקציה זו אינה מחליפה ייעוץ רפואי מקצועי. אם אתה חווה מצב חירום רפואי, פנה מיד לשירותי החירום.';
