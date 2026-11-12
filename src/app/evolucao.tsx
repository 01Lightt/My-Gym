import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { Card } from '@/components/Card';
import { FrequencyCalendar } from '@/components/charts/FrequencyCalendar';
import { LineChart } from '@/components/charts/LineChart';
import { EmptyState } from '@/components/EmptyState';
import { GlossyBubble } from '@/components/GlossyBubble';
import { ScreenLayout, ScreenScrollView } from '@/components/ScreenLayout';
import { SegmentedPills } from '@/components/SegmentedPills';
import { StatTile } from '@/components/StatTile';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import {
  exerciseOptions,
  exerciseSeries,
  METRICS_BY_MODE,
  personalBests,
  summarizeWorkout,
  type Metric,
  type SeriesPoint,
} from '@/data/stats';
import { deleteWorkout, useWorkoutHistory, type Workout } from '@/data/workouts';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { addDays, dayKey, formatShortDate, formatWeekdayDate, startOfMonth, startOfWeek } from '@/utils/date';
import { formatDuration, formatNumber, formatSeconds, formatWeight, plural } from '@/utils/format';

/** Semanas mostradas no calendário de frequência. */
const CALENDAR_WEEKS = 12;

type Period = '1m' | '3m' | 'all';
const PERIODS: { value: Period; label: string; days: number | null }[] = [
  { value: '1m', label: '1 mês', days: 30 },
  { value: '3m', label: '3 meses', days: 90 },
  { value: 'all', label: 'Tudo', days: null },
];

/** Como cada métrica aparece na tela. Quais métricas cada exercício oferece vem de METRICS_BY_MODE (stats.ts). */
type MetricInfo = {
  /** Texto curto da pílula de escolha. */
  label: string;
  /** Título do gráfico. */
  title: string;
  /** Como mostrar o valor (com a unidade). */
  format: (value: number) => string;
  /** true: eixo começa em zero e a área é preenchida (totais). false: eixo focado na faixa dos dados. */
  zeroBaseline: boolean;
};

/** Carga com uma casa decimal (o 1RM estimado dá valores como 52,333...). */
const kg = (value: number) => `${formatWeight(Math.round(value * 10) / 10)} kg`;

// Exercícios com carga: Carga, Volume, 1RM e Reps (esta última serve para os sem carga, como barra fixa).
// Exercícios por tempo (prancha): Maior tempo e Tempo total.
const METRICS: Record<Metric, MetricInfo> = {
  maxWeight: { label: 'Carga', title: 'Carga máxima', format: kg, zeroBaseline: false },
  volume: { label: 'Volume', title: 'Volume (kg × reps)', format: (v) => `${formatNumber(v)} kg`, zeroBaseline: true },
  oneRepMax: { label: '1RM', title: '1RM estimado', format: kg, zeroBaseline: false },
  reps: { label: 'Reps', title: 'Repetições no treino', format: (v) => `${formatNumber(v)} reps`, zeroBaseline: true },
  maxTime: { label: 'Maior tempo', title: 'Maior tempo numa série', format: formatSeconds, zeroBaseline: false },
  totalTime: { label: 'Tempo total', title: 'Tempo total no treino', format: formatSeconds, zeroBaseline: true },
};

/** Valor no eixo do gráfico (sem unidade quando ela é óbvia, para caber). */
const formatAxis = (value: number, metric: Metric) =>
  metric === 'maxTime' || metric === 'totalTime'
    ? formatSeconds(value)
    : metric === 'volume' || metric === 'reps'
      ? formatNumber(value)
      : formatWeight(value);

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
        <ScreenScrollView contentContainerStyle={styles.content}>
          <EmptyState
            icon="stats-chart"
            title="Nenhum treino ainda"
            description="Finalize um treino na tela Treinar para ver sua evolução aqui."
          />
          <WiiButton label="Ir para Treinar" icon="barbell" onPress={() => router.push('/treinar')} />
        </ScreenScrollView>
      </ScreenLayout>
    );
  }

  const weekCount = workouts.filter((w) => w.startedAt >= startOfWeek(now)).length;
  const monthCount = workouts.filter((w) => w.startedAt >= startOfMonth(now)).length;
  const trainedDays = new Set(workouts.map((w) => dayKey(w.startedAt)));
  const calendarStart = addDays(startOfWeek(now), -7 * (CALENDAR_WEEKS - 1));
  const calendarDays = [...trainedDays].filter((key) => key >= dayKey(calendarStart)).length;
  const bests = personalBests(workouts);

  // Tudo abaixo do filtro de período usa só os treinos do período
  const days = PERIODS.find((p) => p.value === period)?.days ?? null;
  const inPeriod = days == null ? workouts : workouts.filter((w) => w.startedAt >= addDays(now, -days));
  const options = exerciseOptions(inPeriod);
  const selected = options.find((o) => o.key === exerciseKey) ?? options[0];
  // Só oferece as métricas com dados para este exercício: um exercício sem carga (barra fixa)
  // mostra as repetições, e um por tempo (prancha) mostra os tempos, em vez de "sem dados".
  const modeMetrics = selected ? METRICS_BY_MODE[selected.mode] : [];
  const withData = modeMetrics.filter((m) => exerciseSeries(inPeriod, selected!.key, m).length > 0);
  const metricChoices = withData.length > 0 ? withData : modeMetrics;
  // A métrica escolhida fica guardada ao trocar de exercício; se o novo exercício não a tem
  // (ex.: "Carga" e depois a prancha), usa a primeira disponível sem perder a escolha anterior.
  const activeMetric = metricChoices.includes(metric) ? metric : metricChoices[0];
  const series = selected && activeMetric ? exerciseSeries(inPeriod, selected.key, activeMetric) : [];
  const history = [...inPeriod].sort((a, b) => b.startedAt - a.startedAt);

  return (
    <ScreenLayout title="Evolução">
      <ScreenScrollView contentContainerStyle={styles.content}>
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

        <Card title="Recordes pessoais" subtitle="Maior carga (ou maior tempo) de cada exercício">
          {bests.length === 0 ? (
            <WiiText variant="label">Ainda sem séries com carga ou tempo registrados.</WiiText>
          ) : (
            bests.map((best) => (
              <View key={best.key} style={styles.liftRow}>
                <WiiText style={styles.liftName} numberOfLines={1}>
                  {best.name}
                </WiiText>
                <WiiText style={styles.liftValue}>
                  {best.mode === 'time' ? formatSeconds(best.value) : `${formatWeight(best.value)} kg`}
                </WiiText>
                <WiiText variant="label" style={styles.liftDate}>
                  {formatShortDate(best.date)}
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
              value={selected!.key}
              onChange={setExerciseKey}
              scrollable
            />
            {/* Com uma métrica só (ex.: barra fixa, só repetições) as pílulas não aparecem: o título do gráfico já diz qual é */}
            {metricChoices.length > 1 && (
              <SegmentedPills
                options={metricChoices.map((m) => ({ value: m, label: METRICS[m].label }))}
                value={activeMetric}
                onChange={setMetric}
              />
            )}
            <ExerciseChartCard key={`${selected!.key}-${activeMetric}-${period}`} series={series} metric={activeMetric} />

            <View style={styles.section}>
              <WiiText variant="title">Treinos no período</WiiText>
              <WiiText variant="label">Segure um treino para excluir</WiiText>
            </View>
            {history.map((workout) => (
              <HistoryItem key={workout.id} workout={workout} />
            ))}
          </>
        )}
      </ScreenScrollView>
    </ScreenLayout>
  );
}

type ChartCardProps = { series: SeriesPoint[]; metric: Metric };

/** Gráfico do exercício com leitura do ponto selecionado e tabela com os mesmos dados. */
function ExerciseChartCard({ series, metric }: ChartCardProps) {
  const { title, format, zeroBaseline } = METRICS[metric];
  const [selectedIndex, setSelected] = useState(series.length - 1);
  // Se um treino for excluído a lista encolhe: a seleção nunca passa do último ponto
  const selected = Math.min(selectedIndex, series.length - 1);
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
          <WiiText style={styles.readoutValue}>{format(point.value)}</WiiText>
        </View>
        {selected > 0 && (
          <View style={styles.changeBox}>
            <WiiText variant="label">desde {formatShortDate(series[0].date)}</WiiText>
            <WiiText style={styles.changeValue}>
              {change > 0 ? '+' : change < 0 ? '−' : ''}
              {format(Math.abs(change))}
            </WiiText>
          </View>
        )}
      </View>

      <LineChart
        points={series.map((p) => ({ x: p.date, y: p.value }))}
        selectedIndex={selected}
        onSelect={setSelected}
        formatY={(v) => formatAxis(v, metric)}
        formatX={formatShortDate}
        zeroBaseline={zeroBaseline}
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
            <WiiText style={styles.tableValue}>{format(p.value)}</WiiText>
          </View>
        ))}
    </Card>
  );
}

/** Um treino da lista. Segurar o dedo em cima pede confirmação para excluir. */
function HistoryItem({ workout }: { workout: Workout }) {
  const summary = summarizeWorkout(workout);

  const remove = () => {
    Vibration.vibrate(30);
    confirmAction(
      'Excluir treino?',
      `O treino de ${formatWeekdayDate(workout.startedAt)} (${workout.name || `Treino ${workout.label}`}) será apagado do histórico, dos gráficos e dos recordes.`,
      'Excluir',
      () => deleteWorkout(workout.id),
    );
  };

  return (
    <BouncyPressable onLongPress={remove}>
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
    </BouncyPressable>
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
