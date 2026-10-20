import Svg, { Circle, Rect } from 'react-native-svg';

// Segmentos acesos de cada dígito (a = topo, b = sup. direito, c = inf. direito,
// d = base, e = inf. esquerdo, f = sup. esquerdo, g = meio)
const DIGITS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
};

type Props = {
  /** Texto com dígitos e ":" (ex.: "20:51"). */
  text: string;
  height: number;
  color: string;
  /** Esconde os dois-pontos (para piscar). */
  colonVisible?: boolean;
};

/** Números de "visor LCD" com segmentos finos e arredondados, como o relógio do Menu do Wii. */
export function SevenSegment({ text, height: h, color, colonVisible = true }: Props) {
  const w = h * 0.5; // largura de um dígito
  const t = h * 0.1; // espessura do segmento
  const gap = t * 0.3; // folga entre segmentos
  const digitSpacing = t * 1.6;
  const colonWidth = t * 2.6;

  const half = h / 2;
  const vertical = half - t / 2 - gap * 2;
  const segments: Record<string, { x: number; y: number; width: number; height: number }> = {
    a: { x: t / 2 + gap, y: 0, width: w - t - gap * 2, height: t },
    g: { x: t / 2 + gap, y: half - t / 2, width: w - t - gap * 2, height: t },
    d: { x: t / 2 + gap, y: h - t, width: w - t - gap * 2, height: t },
    f: { x: 0, y: t / 2 + gap, width: t, height: vertical },
    e: { x: 0, y: half + gap, width: t, height: vertical },
    b: { x: w - t, y: t / 2 + gap, width: t, height: vertical },
    c: { x: w - t, y: half + gap, width: t, height: vertical },
  };

  // Calcula a posição de cada caractere
  let x = 0;
  const chars = [...text].map((char, i) => {
    const start = x + (i > 0 ? digitSpacing : 0);
    x = start + (char === ':' ? colonWidth : w);
    return { char, x: start };
  });

  return (
    <Svg width={x} height={h}>
      {chars.map(({ char, x: cx }, i) => {
        if (char === ':') {
          if (!colonVisible) return null;
          return [0.3, 0.7].map((fy) => (
            <Circle key={`${i}-${fy}`} cx={cx + colonWidth / 2} cy={h * fy} r={t * 0.6} fill={color} />
          ));
        }
        return [...(DIGITS[char] ?? '')].map((name) => {
          const s = segments[name];
          return (
            <Rect
              key={`${i}${name}`}
              x={cx + s.x}
              y={s.y}
              width={s.width}
              height={s.height}
              rx={t / 2}
              fill={color}
            />
          );
        });
      })}
    </Svg>
  );
}
