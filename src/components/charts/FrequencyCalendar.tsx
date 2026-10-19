import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, radius, spacing } from '@/theme';
import { addDays, dayKey, startOfDay, startOfWeek } from '@/utils/date';

const ROW_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const LABEL_WIDTH = 16;
const GAP = 3;
const MAX_CELL = 22;

type Props = {
  /** Dias com treino, no formato de `dayKey`. */
  trainedDays: Set<string>;
  weeks: number;
  now: number;
};

/** Grade de frequência: uma coluna por semana (segunda a domingo), dia com treino fica colorido. */
export function FrequencyCalendar({ trainedDays, weeks, now }: Props) {
  const [width, setWidth] = useState(0);
  const firstWeek = addDays(startOfWeek(now), -7 * (weeks - 1));
  const today = startOfDay(now);

  const cell = Math.min(MAX_CELL, Math.floor((width - LABEL_WIDTH - GAP * weeks) / weeks));

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cell > 0 && (
        <View style={styles.grid}>
          <View style={[styles.labels, { gap: GAP }]}>
            {ROW_LABELS.map((label, i) => (
              <WiiText key={i} variant="label" style={[styles.rowLabel, { height: cell, lineHeight: cell }]}>
                {label}
              </WiiText>
            ))}
          </View>
          {Array.from({ length: weeks }, (_, week) => (
            <View key={week} style={{ gap: GAP }}>
              {Array.from({ length: 7 }, (_, weekday) => {
                const day = addDays(firstWeek, week * 7 + weekday);
                const future = day > today;
                const trained = trainedDays.has(dayKey(day));
                return (
                  <View
                    key={weekday}
                    style={[
                      styles.cell,
                      { width: cell, height: cell },
                      future ? styles.future : trained ? styles.trained : styles.empty,
                      day === today && styles.today,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      )}

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
  grid: { flexDirection: 'row', gap: GAP },
  labels: { width: LABEL_WIDTH },
  rowLabel: { fontSize: 10, textAlign: 'center' },
  cell: { borderRadius: 5 },
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
