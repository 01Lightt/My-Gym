import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/** Distância entre as listras (px). No Wii elas são bem finas e próximas. */
const STRIPE_PERIOD = 3;

/** Fundo do Menu do Wii: cinza neutro com listras horizontais de 1px. */
export function WiiBackground({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={[colors.backgroundTop, colors.backgroundBottom]} style={styles.fill}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <Pattern id="stripes" width={4} height={STRIPE_PERIOD} patternUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={4} height={1} fill={colors.backgroundLines} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#stripes)" />
      </Svg>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
});
