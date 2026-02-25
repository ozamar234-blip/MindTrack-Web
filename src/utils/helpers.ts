export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return formatDate(dateStr);
}

export function getDayName(dayIndex: number): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[dayIndex] || '';
}

export function getIntensityColor(intensity: number): string {
  if (intensity <= 3) return '#00B894';
  if (intensity <= 6) return '#FDCB6E';
  if (intensity <= 8) return '#E17055';
  return '#FF6B6B';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'גבוהה';
  if (confidence >= 0.5) return 'בינונית';
  return 'נמוכה';
}
