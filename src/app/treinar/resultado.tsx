import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GlossyBubble } from '@/components/GlossyBubble';
import { PopIn } from '@/components/PopIn';
import { ScreenLayout } from '@/components/ScreenLayout';
import { StatTile } from '@/components/StatTile';
import { WiiText } from '@/components/WiiText';
import { findRecords, summarizeWorkout } from '@/data/stats';
import { useWorkoutHistory } from '@/data/workouts';
import { colors, fonts, radius, shadows, spacing } from '@/theme';
import { formatDuration, formatNumber, formatWeight } from '@/utils/format';

const STAGGER_MS = 180;

/** Placar do fim do treino, no estilo do resultado do Wii Sports. */
export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, ready } = useWorkoutHistory();
  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <ScreenLayout title="Resultado">
        {ready && (
          <ScrollView contentContainerStyle={styles.content}>
            <EmptyState icon="help-circle" title="Treino não encontrado" description="Ele pode ter sido excluído." />
          </ScrollView>
        )}
      </ScreenLayout>
    );
  }

  const summary = summarizeWorkout(workout);
  const records = findRecords(workout, workouts);

  const stats = [
    { icon: 'time', label: 'Duração', value: formatDuration(summary.durationMs), accent: 'blue' },
    { icon: 'layers', label: 'Séries feitas', value: String(summary.setsDone), accent: 'green' },
    { icon: 'repeat', label: 'Repetições', value: formatNumber(summary.totalReps), accent: 'orange' },
    { icon: 'barbell', label: 'Volume (kg)', value: formatNumber(summary.volumeKg), accent: 'purple' },
  ] as const;

  return (
    <ScreenLayout title="Resultado">
      <ScrollView contentContainerStyle={styles.content}>
        <PopIn>
          <LinearGradient colors={colors.accent[workout.accent]} style={styles.banner}>
            <GlossyBubble accent="orange" size={84} style={styles.trophy}>
              <Ionicons name="trophy" size={46} color={colors.textOnColor} />
            </GlossyBubble>
            <WiiText style={styles.bannerTitle}>Treino concluído!</WiiText>
            <WiiText style={styles.bannerSubtitle}>
              Ficha {workout.label}
              {workout.name ? ` · ${workout.name}` : ''}
            </WiiText>
          </LinearGradient>
        </PopIn>

        <View style={styles.grid}>
          {stats.map((stat, i) => (
            <PopIn key={stat.label} delay={(i + 1) * STAGGER_MS} style={styles.gridItem}>
              <StatTile icon={stat.icon} label={stat.label} value={stat.value} accent={stat.accent} />
            </PopIn>
          ))}
        </View>

        {records.length > 0 && (
          <PopIn delay={(stats.length + 1) * STAGGER_MS}>
            <View style={styles.records}>
              <View style={styles.recordsHeader}>
                <Ionicons name="star" size={24} color={colors.accent.orange[1]} />
                <WiiText style={styles.recordsTitle}>
                  {records.length === 1 ? 'Novo recorde!' : 'Novos recordes!'}
                </WiiText>
                <Ionicons name="star" size={24} color={colors.accent.orange[1]} />
              </View>
              {records.map((record) => (
                <View key={record.name} style={styles.recordRow}>
                  <WiiText style={styles.recordName}>{record.name}</WiiText>
                  <WiiText style={styles.recordValue}>{formatWeight(record.weightKg)} kg</WiiText>
                  <WiiText variant="label">antes {formatWeight(record.previousKg)} kg</WiiText>
                </View>
              ))}
            </View>
          </PopIn>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  banner: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.textOnColor,
    boxShadow: shadows.tile,
  },
  trophy: { borderWidth: 3, borderColor: colors.textOnColor, marginBottom: spacing.sm },
  bannerTitle: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.textOnColor,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  bannerSubtitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.textOnColor },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%', flexGrow: 1 },
  records: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.accent.orange[0],
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  recordsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  recordsTitle: { fontFamily: fonts.black, fontSize: 22, color: colors.accent.orange[1] },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.tileBottom,
  },
  recordName: { flex: 1, fontFamily: fonts.bold, fontSize: 16 },
  recordValue: { fontFamily: fonts.black, fontSize: 18, color: colors.accent.orange[1] },
});
