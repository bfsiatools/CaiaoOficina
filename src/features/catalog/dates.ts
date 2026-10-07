const TIME_ZONE = 'America/Sao_Paulo';

export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function pickDateLabel(iso: string, today: string): string {
  if (iso === today) return 'hoje';
  if (iso === addDays(today, -1)) return 'ontem';
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}
