import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { FrequencyCalendar } from '@/components/charts/FrequencyCalendar';
import { LineChart } from '@/components/charts/LineChart';
import { EmptyState } from '@/components/EmptyState';
import { GlossyBubble } from '@/components/GlossyBubble';
import { ScreenLayout } from '@/components/ScreenLayout';
import { SegmentedPills } from '@/components/SegmentedPills';
import { StatTile } from '@/components/StatTile';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import {
  bestLifts,
  exerciseOptions,
  exerciseSeries,
  summarizeWorkout,
  type Metric,
  type SeriesPoint,
} from '@/data/stats';
import { useWorkoutHistory, type Workout } from '@/data/workouts';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, spacing } from '@/theme';
import { addDays, dayKey, formatShortDate, formatWeekdayDate, startOfMonth, startOfWeek } from '@/utils/date';
import { formatDuration, formatNumber, formatWeight, plural } from '@/utils/format';

/** Semanas mostradas no calendário de frequência. */
const CALENDAR_WEEKS = 12;

type Period = '1m' | '3m' | 'all';
const PERIODS: { value: Period; label: string; days: number | null }[] = [
  { value: '1m', label: '1 mês', days: 30 },
  { value: '3m', label: '3 meses', days: 90 },
  { value: 'all', label: 'Tudo', days: null },
];

const METRICS: { value: Metric; label: string; title: string; unit: string }[] = [
  { value: 'maxWeight', label: 'Carga', title: 'Carga máxima', unit: 'kg' },
  { value: 'volume', label: 'Volume', title: 'Volume (kg × reps)', unit: 'kg' },
  { value: 'oneRepMax', label: '1RM', title: '1RM estimado', unit: 'kg' },
];

const formatMetric = (value: number, metric: Metric) =>
  metric === 'volume' ? formatNumber(value) : formatWeight(Math.round(value * 10) / 10);

/** Evolução: resumo de frequência, recordes e gráficos por exercício + lista de treinos. */
export default function EvolucaoScreen() {
  const { workouts, ready } = useWorkoutHistory();
  const now = useNow(60_000);
  const [period, setPeriod] = useState<Period>('3m');
  const [metric, setMetric] = useState<Metric>('maxWeight');
  const [exerciseKey, setExerciseKey] = useState<string | null>(null);

  if (ready && workouts.length === 0) {
    return (
      <ScreenLayout title="Evolução">
        <ScrollView contentContainerStyle={styles.content}>
          <EmptyState
            icon="stats-chart"
            title="Nenhum treino ainda"
            description="Finalize um treino na tela Treinar para ver sua evolução aqui."
          />
          <WiiButton label="Ir para Treinar" icon="barbell" onPress={() => router.push('/treinar')} />
        </ScrollView>
      </ScreenLayout>
    );
  }

  const weekCount = workouts.filter((w) => w.startedAt >= startOfWeek(now)).length;
  const monthCount = workouts.filter((w) => w.startedAt >= startOfMonth(now)).length;
  const trainedDays = new Set(workouts.map((w) => dayKey(w.startedAt)));
  const calendarStart = addDays(startOfWeek(now), -7 * (CALENDAR_WEEKS - 1));
  const calendarDays = [...trainedDays].filter((key) => key >= dayKey(calendarStart)).length;
  const lifts = bestLifts(workouts);

  // Tudo abaixo do filtro de período usa só os treinos do período
  const days = PERIODS.find((p) => p.value === period)?.days ?? null;
  const inPeriod = days == null ? workouts : workouts.filter((w) => w.startedAt >= addDays(now, -days));
  const options = exerciseOptions(inPeriod);
  const selectedKey = options.some((o) => o.key === exerciseKey) ? exerciseKey! : options[0]?.key;
  const series = selectedKey ? exerciseSeries(inPeriod, selectedKey, metric) : [];
  const metricInfo = METRICS.find((m) => m.value === metric)!;
  const history = [...inPeriod].sort((a, b) => b.startedAt - a.startedAt);

  return (
    <ScreenLayout title="Evolução">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile icon="calendar" label="Treinos esta semana" value={String(weekCount)} accent="blue" />
          </View>
          <View style={styles.gridItem}>
            <StatTile icon="calendar-number" label="Treinos este mês" value={String(monthCount)} accent="green" />
          </View>
        </View>

        <Card
          title="Frequência"
          subtitle={`${plural(calendarDays, 'dia', 'dias')} de treino nas últimas ${CALENDAR_WEEKS} semanas`}>
          <FrequencyCalendar trainedDays={trainedDays} weeks={CALENDAR_WEEKS} now={now} />
        </Card>

        <Card title="Recordes pessoais" subtitle="Maior carga de cada exercício">
          {lifts.length === 0 ? (
            <WiiText variant="label">Ainda sem séries com carga registradas.</WiiText>
          ) : (
            lifts.map((lift) => (
              <View key={lift.key} style={styles.liftRow}>
                <WiiText style={styles.liftName} numberOfLines={1}>
                  {lift.name}
                </WiiText>
                <WiiText style={styles.liftValue}>{formatWeight(lift.weightKg)} kg</WiiText>
                <WiiText variant="label" style={styles.liftDate}>
                  {formatShortDate(lift.date)}
                </WiiText>
              </View>
            ))
          )}
        </Card>

        <WiiText variant="title" style={styles.section}>
          Por exercício
        </WiiText>
        <SegmentedPills options={PERIODS} value={period} onChange={setPeriod} />

        {options.length === 0 ? (
          <EmptyState icon="calendar-clear" title="Sem treinos no período" description="Escolha um período maior." />
        ) : (
          <>
            <SegmentedPills
              options={options.map((o) => ({ value: o.key, label: o.name }))}
              value={selectedKey!}
              onChange={setExerciseKey}
              scrollable
            />
            <SegmentedPills options={METRICS} value={metric} onChange={setMetric} />
            <ExerciseChartCard
              key={`${selectedKey}-${metric}-${period}`}
              title={metricInfo.title}
              series={series}
              metric={metric}
              unit={metricInfo.unit}
            />

            <WiiText variant="title" style={styles.section}>
              Treinos no período
            </WiiText>
            {history.map((workout) => (
              <HistoryItem key={workout.id} workout={workout} />
            ))}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

type ChartCardProps = { title: string; series: SeriesPoint[]; metric: Metric; unit: string };

/** Gráfico do exercício com leitura do ponto selecionado e tabela com os mesmos dados. */
function ExerciseChartCard({ title, series, metric, unit }: ChartCardProps) {
  const [selected, setSelected] = useState(series.length - 1);
  const [showTable, setShowTable] = useState(false);
  const point = series[selected];

  if (series.length === 0) {
    return (
      <Card title={title}>
        <WiiText variant="label">Sem dados desse exercício para esta métrica no período.</WiiText>
      </Card>
    );
  }

  const first = series[0].value;
  const change = point.value - first;

  return (
    <Card>
      <View style={styles.readout}>
        <View style={styles.flex}>
          <WiiText variant="label">
            {title} · {formatWeekdayDate(point.date)}
          </WiiText>
          <WiiText style={styles.readoutValue}>
            {formatMetric(point.value, metric)} {unit}
          </WiiText>
        </View>
        {selected > 0 && (
          <View style={styles.changeBox}>
            <WiiText variant="label">desde {formatShortDate(series[0].date)}</WiiText>
            <WiiText style={styles.changeValue}>
              {change > 0 ? '+' : change < 0 ? '−' : ''}
              {formatMetric(Math.abs(change), metric)} {unit}
            </WiiText>
          </View>
        )}
      </View>

      <LineChart
        points={series.map((p) => ({ x: p.date, y: p.value }))}
        selectedIndex={selected}
        onSelect={setSelected}
        formatY={(v) => (metric === 'volume' ? formatNumber(v) : formatWeight(v))}
        formatX={formatShortDate}
        zeroBaseline={metric === 'volume'}
      />
      <WiiText variant="label" style={styles.hint}>
        {plural(series.length, 'treino', 'treinos')} · toque em um ponto para ver o valor
      </WiiText>

      <WiiButton
        label={showTable ? 'Esconder tabela' : 'Ver tabela'}
        icon="list"
        variant="outline"
        onPress={() => setShowTable((s) => !s)}
      />
      {showTable &&
        [...series].reverse().map((p) => (
          <View key={p.workoutId} style={styles.tableRow}>
            <WiiText style={styles.flex}>{formatWeekdayDate(p.date)}</WiiText>
            <WiiText style={styles.tableValue}>
              {formatMetric(p.value, metric)} {unit}
            </WiiText>
          </View>
        ))}
    </Card>
  );
}

function HistoryItem({ workout }: { workout: Workout }) {
  const summary = summarizeWorkout(workout);
  return (
    <Card style={styles.historyCard}>
      <GlossyBubble accent={workout.accent} size={48} shape="rounded">
        <WiiText style={styles.historyLetter}>{workout.label}</WiiText>
      </GlossyBubble>
      <View style={styles.flex}>
        <WiiText style={styles.historyTitle} numberOfLines={1}>
          {workout.name || `Treino ${workout.label}`}
        </WiiText>
        <WiiText variant="label">
          {formatWeekdayDate(workout.startedAt)} · {formatDuration(summary.durationMs)}
        </WiiText>
        <WiiText variant="label">
          {plural(summary.setsDone, 'série', 'séries')} · {formatNumber(summary.volumeKg)} kg de volume
        </WiiText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  grid: { flexDirection: 'row', gap: spacing.md },
  gridItem: { flex: 1 },
  section: { marginTop: spacing.sm, marginLeft: spacing.xs },
  flex: { flex: 1 },
  liftRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.chart.grid,
  },
  liftName: { flex: 1, fontFamily: fonts.bold },
  liftValue: { fontFamily: fonts.black, fontSize: 17 },
  liftDate: { width: 44, textAlign: 'right' },
  readout: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  readoutValue: { fontFamily: fonts.black, fontSize: 30, lineHeight: 36 },
  changeBox: { alignItems: 'flex-end' },
  changeValue: { fontFamily: fonts.bold, fontSize: 16 },
  hint: { textAlign: 'center', marginTop: -spacing.sm },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.chart.grid,
  },
  tableValue: { fontFamily: fonts.bold },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historyLetter: { fontFamily: fonts.black, fontSize: 24, color: colors.textOnColor },
  historyTitle: { fontFamily: fonts.bold, fontSize: 17 },
});
