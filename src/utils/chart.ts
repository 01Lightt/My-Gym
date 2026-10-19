/** Passo "redondo" (1, 2, 2,5 ou 5 × 10ⁿ) para dividir um intervalo em ~count partes. */
function niceStep(range: number, count: number) {
  const raw = range / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Marcas do eixo Y em números redondos que cobrem [min, max]. Nunca abaixo de zero para dados positivos. */
export function niceTicks(min: number, max: number, count = 4) {
  if (min === max) {
    const padding = Math.abs(min) * 0.1 || 1;
    min -= padding;
    max += padding;
  }
  const step = niceStep(max - min, count);
  let start = Math.floor(min / step) * step;
  if (min >= 0 && start < 0) start = 0;
  const end = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toFixed(6)));
  return ticks;
}
