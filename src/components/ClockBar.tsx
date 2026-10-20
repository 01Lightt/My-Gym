import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { SevenSegment } from '@/components/SevenSegment';
import { WiiText } from '@/components/WiiText';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, spacing } from '@/theme';
import { formatWeekdayDate } from '@/utils/date';

/** Quanto a linha ciano desce no meio da barra (px). */
const DIP = 26;
/** Altura dos dígitos do relógio. */
const DIGIT_HEIGHT = 38;
/** Altura do conteúdo abaixo da curva (relógio + data + respiro). */
const CONTENT_HEIGHT = DIGIT_HEIGHT + 44;

// Onde a curva começa e termina, em fração da largura (medido no Menu do Wii original)
const CURVE = { a: 0.17, b: 0.32, c: 0.68, d: 0.83 };

const pad = (n: number) => String(n).padStart(2, '0');

/** Contorno de cima da barra: reto nas laterais, desce em curva suave e forma um "vale" no centro. */
function edgePath(width: number) {
  const [a, b, c, d] = [CURVE.a, CURVE.b, CURVE.c, CURVE.d].map((f) => f * width);
  const top = 1.5;
  return (
    `M0,${top} L${a},${top} ` +
    `C${(a + b) / 2},${top} ${(a + b) / 2},${DIP} ${b},${DIP} ` +
    `L${c},${DIP} ` +
    `C${(c + d) / 2},${DIP} ${(c + d) / 2},${top} ${d},${top} ` +
    `L${width},${top}`
  );
}

/** Barra inferior do Menu do Wii: cinza com linha ciano curva, relógio LCD e data. */
export function ClockBar() {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const now = new Date(useNow(1000));
  const height = DIP + CONTENT_HEIGHT + insets.bottom;
  const edge = width > 0 ? edgePath(width) : '';

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.barTop} />
              <Stop offset="1" stopColor={colors.barBottom} />
            </LinearGradient>
          </Defs>
          <Path d={`${edge} L${width},${height} L0,${height} Z`} fill="url(#bar)" />
          {/* Reflexo branco logo abaixo da linha, e a linha ciano por cima */}
          <Path d={edge} transform="translate(0, 2.5)" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={2} fill="none" />
          <Path d={edge} stroke={colors.barLine} strokeWidth={2.5} fill="none" />
        </Svg>
      )}

      <View style={[styles.content, { paddingTop: DIP + spacing.sm }]}>
        <SevenSegment
          text={`${pad(now.getHours())}:${pad(now.getMinutes())}`}
          height={DIGIT_HEIGHT}
          color={colors.clock}
          colonVisible={now.getSeconds() % 2 === 0}
        />
        <WiiText style={styles.date}>{formatWeekdayDate(now.getTime())}</WiiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: spacing.xs },
  date: { fontFamily: fonts.bold, fontSize: 18, color: colors.clock },
});
