import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, shadows } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** Quanto do anel aparece quando está parado: 1 = cheio, 0 = vazio. */
  progress: number;
  /**
   * Quando informado, o anel esvazia sozinho, de forma contínua, até `endsAt`
   * (a animação roda na thread de interface, a 60 quadros por segundo).
   */
  countdown?: { endsAt: number; totalMs: number } | null;
  size: number;
  color: string;
  strokeWidth?: number;
  children?: ReactNode;
};

/** Anel que vai esvaziando no sentido horário, com um disco branco no meio para o conteúdo. */
export function CountdownRing({ progress, countdown, size, color, strokeWidth = 18, children }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const inner = size - strokeWidth * 2 - 16;

  const fraction = useSharedValue(progress);
  const endsAt = countdown?.endsAt;
  const totalMs = countdown?.totalMs;

  useEffect(() => {
    cancelAnimation(fraction);
    if (endsAt != null && totalMs) {
      // Começa de onde o tempo realmente está e desce em linha reta até zero
      const remaining = Math.max(0, endsAt - Date.now());
      fraction.value = remaining / totalMs;
      fraction.value = withTiming(0, { duration: remaining, easing: Easing.linear });
    } else {
      fraction.value = Math.min(1, Math.max(0, progress));
    }
  }, [fraction, progress, endsAt, totalMs]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fraction.value),
    // Com a ponta arredondada, um anel "vazio" ainda mostraria um pontinho
    strokeOpacity: fraction.value > 0.001 ? 1 : 0,
  }));

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.chart.empty} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
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
