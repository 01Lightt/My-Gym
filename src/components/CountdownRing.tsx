import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, shadows } from '@/theme';

type Props = {
  /** 1 = anel cheio, 0 = vazio. */
  progress: number;
  size: number;
  color: string;
  strokeWidth?: number;
  children?: ReactNode;
};

/** Anel que vai esvaziando no sentido horário, com um disco branco no meio para o conteúdo. */
export function CountdownRing({ progress, size, color, strokeWidth = 18, children }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const clamped = Math.min(1, Math.max(0, progress));
  const inner = size - strokeWidth * 2 - 16;

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.chart.empty} strokeWidth={strokeWidth} fill="none" />
        {clamped > 0.001 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </Svg>
      <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
});
