/** Converte o texto digitado ("22,5" ou "22.5") em número de kg; vazio ou inválido vira null. */
export function parseWeight(text: string): number | null {
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** Mostra um peso no formato brasileiro, ex.: 22.5 → "22,5". */
export function formatWeight(kg: number) {
  return String(kg).replace('.', ',');
}

/** Pega o primeiro número do texto: "10" → 10, "8-10" → 8; sem número vira null. */
export function parseReps(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Duração em "mm:ss" ou "h:mm:ss". */
export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Número inteiro com separador de milhar brasileiro, ex.: 12500 → "12.500". */
export function formatNumber(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
