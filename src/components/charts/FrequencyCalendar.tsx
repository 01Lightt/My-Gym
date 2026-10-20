import { StyleSheet, View } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, radius, spacing } from '@/theme';
import { addDays, dayKey, startOfDay, startOfWeek } from '@/utils/date';

const ROW_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const LABEL_WIDTH = 16;
const GAP = 3;

type Props = {
  /** Dias com treino, no formato de `dayKey`. */
  trainedDays: Set<string>;
  weeks: number;
  now: number;
};

/**
 * Grade de frequência: uma coluna por semana (segunda a domingo), dia com treino fica colorido.
 * As células dividem a largura igualmente e são sempre quadradas, então a grade ocupa o cartão todo.
 */
export function FrequencyCalendar({ trainedDays, weeks, now }: Props) {
  const firstWeek = addDays(startOfWeek(now), -7 * (weeks - 1));
  const today = startOfDay(now);

  return (
    <View>
      <View style={styles.grid}>
        {ROW_LABELS.map((label, weekday) => (
          <View key={weekday} style={styles.row}>
            <WiiText variant="label" style={styles.rowLabel}>
              {label}
            </WiiText>
            {Array.from({ length: weeks }, (_, week) => {
              const day = addDays(firstWeek, week * 7 + weekday);
              const future = day > today;
              const trained = trainedDays.has(dayKey(day));
              return (
                <View
                  key={week}
                  style={[
                    styles.cell,
                    future ? styles.future : trained ? styles.trained : styles.empty,
                    day === today && styles.today,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={[styles.swatch, styles.trained]} />
        <WiiText variant="label">Treinou</WiiText>
        <View style={[styles.swatch, styles.empty]} />
        <WiiText variant="label">Não treinou</WiiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: GAP },
  row: { flexDirection: 'row', alignItems: 'center', gap: GAP },
  rowLabel: { width: LABEL_WIDTH, fontSize: 10, textAlign: 'center' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 5 },
  trained: { backgroundColor: colors.chart.data },
  empty: { backgroundColor: colors.chart.empty },
  future: { backgroundColor: 'transparent' },
  today: { borderWidth: 2, borderColor: colors.text },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  swatch: { width: 12, height: 12, borderRadius: radius.sm / 3, marginLeft: spacing.xs },
});
