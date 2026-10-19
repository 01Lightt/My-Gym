import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GlossyBubble } from '@/components/GlossyBubble';
import { RoutineCard } from '@/components/RoutineCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { useRoutines, type Routine } from '@/data/routines';
import { countSets } from '@/data/stats';
import { discardWorkout, startWorkout, useActiveWorkout, type Workout } from '@/data/workouts';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, radius, shadows, spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { formatDuration } from '@/utils/format';

/** Escolher a ficha do dia para começar — ou continuar o treino em andamento. */
export default function TreinarScreen() {
  const { workout, ready: workoutReady } = useActiveWorkout();
  const { routines, ready: routinesReady } = useRoutines();
  const startable = routines.filter((r) => r.exercises.length > 0);

  const start = (routine: Routine) => {
    startWorkout(routine);
    router.push('/treinar/sessao');
  };

  return (
    <ScreenLayout title="Treinar">
      <ScrollView contentContainerStyle={styles.content}>
        {workout ? (
          <ActiveWorkoutCard workout={workout} />
        ) : (
          workoutReady &&
          routinesReady && (
            <>
              {startable.length === 0 ? (
                <>
                  <EmptyState
                    icon="clipboard"
                    title="Nenhuma ficha pronta"
                    description="Crie uma ficha com pelo menos um exercício para começar a treinar."
                  />
                  <WiiButton label="Ir para Fichas" icon="clipboard" accent="green" onPress={() => router.push('/fichas')} />
                </>
              ) : (
                <WiiText variant="title" style={styles.section}>
                  Qual é o treino de hoje?
                </WiiText>
              )}
              {startable.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} action="start" onPress={() => start(routine)} />
              ))}
            </>
          )
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

function ActiveWorkoutCard({ workout }: { workout: Workout }) {
  const now = useNow(1000);
  const { done, total } = countSets(workout);

  const discard = () =>
    confirmAction(
      'Descartar treino?',
      'As séries marcadas neste treino serão perdidas.',
      'Descartar',
      discardWorkout,
    );

  return (
    <View style={[styles.activeCard, { borderColor: colors.accent[workout.accent][1] }]}>
      <View style={styles.activeHeader}>
        <GlossyBubble accent={workout.accent} size={64} shape="rounded">
          <WiiText style={styles.letter}>{workout.label}</WiiText>
        </GlossyBubble>
        <View style={styles.flex}>
          <WiiText variant="label">Treino em andamento</WiiText>
          <WiiText variant="title" numberOfLines={1}>
            {workout.name || `Treino ${workout.label}`}
          </WiiText>
          <WiiText style={[styles.meta, { color: colors.accent[workout.accent][1] }]}>
            {formatDuration(now - workout.startedAt)} · {done}/{total} séries
          </WiiText>
        </View>
      </View>
      <WiiButton label="Continuar treino" icon="play" accent="green" onPress={() => router.push('/treinar/sessao')} />
      <WiiButton label="Descartar" icon="trash" accent="red" variant="outline" onPress={discard} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  section: { marginLeft: spacing.xs },
  activeCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 3,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  letter: { fontFamily: fonts.black, fontSize: 32, color: colors.textOnColor },
  flex: { flex: 1 },
  meta: { fontFamily: fonts.bold, fontSize: 15 },
});
