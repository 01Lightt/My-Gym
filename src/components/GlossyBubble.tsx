import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, type AccentName } from '@/theme';

/** Espessura do anel opcional (`ringColor`), somada em volta da bolha. */
export const RING_WIDTH = 3;

type Props = {
  accent: AccentName;
  size: number;
  /** Cantos: círculo (padrão) ou quadrado arredondado. */
  shape?: 'circle' | 'rounded';
  /**
   * Cor de um anel em volta da bolha (ex.: para marcar como selecionada).
   * Fica em uma View separada: borda/transform direto no gradiente renderiza errado no Android.
   */
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Bolha colorida com brilho no topo — o aspecto "plástico" dos ícones do Wii. */
export function GlossyBubble({ accent, size, shape = 'circle', ringColor, style, children }: Props) {
  const borderRadius = shape === 'circle' ? radius.pill : size * 0.28;

  const bubble = (
    <LinearGradient
      colors={colors.accent[accent]}
      style={[styles.bubble, { width: size, height: size, borderRadius }, ringColor === undefined && style]}>
      <View
        style={[
          styles.gloss,
          { height: size * 0.42, borderRadius, top: size * 0.05, left: size * 0.12, right: size * 0.12 },
        ]}
      />
      {children}
    </LinearGradient>
  );

  if (ringColor === undefined) return bubble;

  return (
    <View
      style={[
        styles.ring,
        { borderColor: ringColor, borderRadius: shape === 'circle' ? radius.pill : borderRadius + RING_WIDTH },
        style,
      ]}>
      {bubble}
    </View>
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
  ring: { borderWidth: RING_WIDTH },
});
