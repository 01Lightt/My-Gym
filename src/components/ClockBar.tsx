import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WiiText } from '@/components/WiiText';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, shadows, spacing } from '@/theme';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Barra inferior com relógio e data, igual à do menu do Wii (com os dois-pontos piscando). */
export function ClockBar() {
  const insets = useSafeAreaInsets();
  const now = new Date(useNow(1000));

  const colonVisible = now.getSeconds() % 2 === 0;

  return (
    <LinearGradient
      colors={[colors.barTop, colors.barBottom]}
      style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.clockRow}>
        <WiiText style={styles.clock}>{pad(now.getHours())}</WiiText>
        <WiiText style={[styles.clock, !colonVisible && styles.hidden]}>:</WiiText>
        <WiiText style={styles.clock}>{pad(now.getMinutes())}</WiiText>
      </View>
      <WiiText style={styles.date}>
        {WEEKDAYS[now.getDay()]} {pad(now.getDate())}/{pad(now.getMonth() + 1)}
      </WiiText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderColor: colors.barBorder,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    boxShadow: shadows.bar,
  },
  clockRow: { flexDirection: 'row', alignItems: 'center' },
  clock: {
    fontSize: 46,
    lineHeight: 54,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  hidden: { opacity: 0 },
  date: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
});
