import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

const LINE_GAP = 6;
const LINE_COUNT = 220;

/** Fundo do menu do Wii: gradiente claro com listras horizontais finas. */
export function WiiBackground({ children }: { children: ReactNode }) {
  return (
    <LinearGradient
      colors={[colors.backgroundTop, colors.backgroundBottom]}
      style={styles.fill}>
      <View pointerEvents="none" style={styles.lines}>
        {Array.from({ length: LINE_COUNT }, (_, i) => (
          <View key={i} style={[styles.line, { top: i * LINE_GAP }]} />
        ))}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  lines: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.backgroundLines,
  },
});
