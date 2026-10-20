import Svg, { Circle, G, Line, Polyline } from 'react-native-svg';

type Props = {
  height: number;
  color: string;
  /** Cor da "sombra" de 1px logo abaixo, que dá o efeito de relevo. */
  shadowColor?: string;
};

// Desenho numa grade de 62×34: W de traços finos com pontas redondas e dois "i" com pingos redondos
const VIEW_W = 62;
const VIEW_H = 34;
const STROKE = 4.6;

function Letters({ color }: { color: string }) {
  return (
    <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <Polyline points="3,5 11.5,30 19,12 26.5,30 35,5" />
      <Line x1={45} y1={14} x2={45} y2={30} />
      <Line x1={56} y1={14} x2={56} y2={30} />
      <Circle cx={45} cy={5.5} r={3.3} fill={color} stroke="none" />
      <Circle cx={56} cy={5.5} r={3.3} fill={color} stroke="none" />
    </G>
  );
}

/** Marca "Wii" desenhada em SVG (no formato do logo), usada em relevo nos blocos vazios do menu. */
export function WiiMark({ height, color, shadowColor = 'rgba(0, 0, 0, 0.12)' }: Props) {
  const width = (height * VIEW_W) / VIEW_H;
  const offset = VIEW_H / height; // 1px na escala do desenho

  return (
    <Svg width={width} height={height} viewBox={`0 ${-offset} ${VIEW_W} ${VIEW_H + offset * 2}`}>
      <G transform={`translate(0, ${offset})`}>
        <Letters color={shadowColor} />
      </G>
      <Letters color={color} />
    </Svg>
  );
}
