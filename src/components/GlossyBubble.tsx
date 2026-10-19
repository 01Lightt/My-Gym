import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, type AccentName } from '@/theme';

type Props = {
  accent: AccentName;
  size: number;
  /** Cantos: círculo (padrão) ou quadrado arredondado. */
  shape?: 'circle' | 'rounded';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Bolha colorida com brilho no topo — o aspecto "plástico" dos ícones do Wii. */
export function GlossyBubble({ accent, size, shape = 'circle', style, children }: Props) {
  const borderRadius = shape === 'circle' ? radius.pill : size * 0.28;

  return (
    <LinearGradient
      colors={colors.accent[accent]}
      style={[styles.bubble, { width: size, height: size, borderRadius }, style]}>
      <View
        style={[
          styles.gloss,
          { height: size * 0.42, borderRadius, top: size * 0.05, left: size * 0.12, right: size * 0.12 },
        ]}
      />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.button,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});
