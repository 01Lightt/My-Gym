/** Converte o texto digitado ("22,5" ou "22.5") em número de kg; vazio ou inválido vira null. */
export function parseWeight(text: string): number | null {
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** Mostra um peso no formato brasileiro, ex.: 22.5 → "22,5". */
export function formatWeight(kg: number) {
  return String(kg).replace('.', ',');
}

export function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
