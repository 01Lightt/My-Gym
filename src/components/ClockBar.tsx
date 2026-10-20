import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { SevenSegment } from '@/components/SevenSegment';
import { WiiText } from '@/components/WiiText';
import { useNow } from '@/hooks/useNow';
import { colors, fonts } from '@/theme';
import { formatWeekdayDate } from '@/utils/date';

/** Altura dos dígitos do relógio. */
const DIGIT_HEIGHT = 28;
/**
 * Quanto a linha ciano desce no meio. Como no Menu do Wii, ela passa por baixo do relógio:
 * a hora fica na área clara de cima (junto com o menu) e a data na barra escura de baixo.
 */
const DIP = DIGIT_HEIGHT + 18;
/** Altura da barra escura abaixo do "vale" (onde fica a data). */
const DATE_AREA = 48;

// Onde a curva começa e termina, em fração da largura. A descida é larga e suave,
// como no Menu do Wii (numa tela de celular o vale é mais fundo, então a curva precisa de mais espaço).
const CURVE = { a: 0.1, b: 0.3, c: 0.7, d: 0.9 };

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

/** Barra inferior do Menu do Wii: linha ciano curva, relógio LCD em cima e data na barra escura. */
export function ClockBar() {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const now = new Date(useNow(1000));
  const height = DIP + DATE_AREA + insets.bottom;
  const edge = width > 0 ? edgePath(width) : '';

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.barTop} />
              <Stop offset="0.55" stopColor={colors.barBottom} />
              <Stop offset="1" stopColor={colors.barBottom} />
            </LinearGradient>
          </Defs>
          <Path d={`${edge} L${width},${height} L0,${height} Z`} fill="url(#bar)" />
          {/* Brilho branco logo acima da linha, e a linha ciano por cima */}
          <Path d={edge} transform="translate(0, -2.5)" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={2} fill="none" />
          <Path d={edge} stroke={colors.barLine} strokeWidth={2.5} fill="none" />
        </Svg>
      )}

      {/* Hora: no "bolso" claro acima da linha */}
      <View style={[styles.clock, { top: (DIP - DIGIT_HEIGHT) / 2 }]}>
        <SevenSegment
          text={`${pad(now.getHours())}:${pad(now.getMinutes())}`}
          height={DIGIT_HEIGHT}
          color={colors.clock}
          colonVisible={now.getSeconds() % 2 === 0}
        />
      </View>

      {/* Data: na barra escura, abaixo da linha */}
      <View style={[styles.dateRow, { top: DIP + 8 }]}>
        <WiiText style={styles.date}>{formatWeekdayDate(now.getTime())}</WiiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dateRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  date: { fontFamily: fonts.bold, fontSize: 19, color: colors.date },
});
