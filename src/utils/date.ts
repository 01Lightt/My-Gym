export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const pad = (n: number) => String(n).padStart(2, '0');

export function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Início da semana (segunda-feira, 00:00). */
export function startOfWeek(time: number) {
  const date = new Date(startOfDay(time));
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date.getTime();
}

export function startOfMonth(time: number) {
  const date = new Date(startOfDay(time));
  date.setDate(1);
  return date.getTime();
}

export function addDays(time: number, days: number) {
  const date = new Date(time);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/** Chave única do dia (no fuso local), ex.: "2026-10-19". */
export function dayKey(time: number) {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "19/10" */
export function formatShortDate(time: number) {
  const date = new Date(time);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

/** "Seg 19/10" */
export function formatWeekdayDate(time: number) {
  return `${WEEKDAYS[new Date(time).getDay()]} ${formatShortDate(time)}`;
}
