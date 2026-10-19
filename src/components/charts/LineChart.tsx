import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/theme';
import { niceTicks } from '@/utils/chart';

export type ChartPoint = { x: number; y: number };

type Props = {
  points: ChartPoint[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatY: (value: number) => string;
  formatX: (value: number) => string;
  /**
   * true: eixo começa em zero e a área abaixo da linha é preenchida (para totais, como volume).
   * false: eixo focado na faixa dos dados, só a linha (para cargas, onde a variação é pequena).
   */
  zeroBaseline?: boolean;
  height?: number;
};

const PAD = { top: 12, right: 14, bottom: 26, left: 44 };
const HIT_WIDTH = 44;

/**
 * Gráfico de linha de uma série: linha de 2px, pontos com anel branco,
 * grade fina. Tocar perto de um ponto o seleciona (o valor aparece fora do gráfico).
 */
export function LineChart({
  points,
  selectedIndex,
  onSelect,
  formatY,
  formatX,
  zeroBaseline = false,
  height = 200,
}: Props) {
  const [width, setWidth] = useState(0);
  const color = colors.chart.data;

  const ys = points.map((p) => p.y);
  const ticks = niceTicks(zeroBaseline ? 0 : Math.min(...ys), Math.max(...ys));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];

  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const baseline = PAD.top + plotH;

  const scaleX = (x: number) => (xMax === xMin ? PAD.left + plotW / 2 : PAD.left + ((x - xMin) / (xMax - xMin)) * plotW);
  const scaleY = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const coords = points.map((p) => ({ cx: scaleX(p.x), cy: scaleY(p.y) }));
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.cx},${c.cy}`).join(' ');
  const areaPath =
    zeroBaseline && coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].cx},${baseline} L${coords[0].cx},${baseline} Z`
      : '';
  const selected = coords[selectedIndex];

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          <Svg width={width} height={height}>
            {ticks.map((tick) => (
              <Line
                key={`g${tick}`}
                x1={PAD.left}
                x2={width - PAD.right}
                y1={scaleY(tick)}
                y2={scaleY(tick)}
                stroke={colors.chart.grid}
                strokeWidth={1}
              />
            ))}
            {ticks.map((tick) => (
              <SvgText
                key={`t${tick}`}
                x={PAD.left - 8}
                y={scaleY(tick) + 4}
                fontSize={11}
                fontFamily={fonts.regular}
                fill={colors.textMuted}
                textAnchor="end">
                {formatY(tick)}
              </SvgText>
            ))}

            <SvgText
              x={coords[0].cx}
              y={height - 6}
              fontSize={11}
              fontFamily={fonts.regular}
              fill={colors.textMuted}
              textAnchor={coords.length > 1 ? 'start' : 'middle'}>
              {formatX(points[0].x)}
            </SvgText>
            {coords.length > 1 && (
              <SvgText
                x={coords[coords.length - 1].cx}
                y={height - 6}
                fontSize={11}
                fontFamily={fonts.regular}
                fill={colors.textMuted}
                textAnchor="end">
                {formatX(points[points.length - 1].x)}
              </SvgText>
            )}

            {selected && (
              <Line
                x1={selected.cx}
                x2={selected.cx}
                y1={PAD.top}
                y2={baseline}
                stroke={colors.tileBorder}
                strokeWidth={1}
              />
            )}

            {areaPath ? <Path d={areaPath} fill={color} fillOpacity={0.1} /> : null}
            {coords.length > 1 && (
              <Path d={linePath} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            )}

            {coords.map((c, i) => (
              <Circle
                key={`p${i}`}
                cx={c.cx}
                cy={c.cy}
                r={i === selectedIndex ? 6 : 4}
                fill={color}
                stroke={colors.tileTop}
                strokeWidth={2}
              />
            ))}
          </Svg>

          {/* Áreas de toque maiores que os pontos, para facilitar selecionar no celular */}
          {coords.map((c, i) => {
            const prev = coords[i - 1]?.cx ?? c.cx - HIT_WIDTH;
            const next = coords[i + 1]?.cx ?? c.cx + HIT_WIDTH;
            const left = Math.max(0, (prev + c.cx) / 2);
            const right = Math.min(width, (c.cx + next) / 2);
            return (
              <Pressable
                key={`h${i}`}
                onPress={() => onSelect(i)}
                style={[styles.hit, { left, width: Math.max(1, right - left), height: baseline }]}
              />
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', top: 0 },
});
