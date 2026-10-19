import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { RestTimer } from '@/components/RestTimer';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { WorkoutExerciseCard } from '@/components/WorkoutExerciseCard';
import { REST_SECONDS } from '@/config/workout';
import { countSets } from '@/data/stats';
import {
  addSet,
  discardWorkout,
  finishWorkout,
  removeSet,
  updateSet,
  useActiveWorkout,
} from '@/data/workouts';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, radius, spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { formatDuration } from '@/utils/format';

type Rest = { endsAt: number; totalSeconds: number };

const startRest = (): Rest => ({ endsAt: Date.now() + REST_SECONDS * 1000, totalSeconds: REST_SECONDS });

/** Treino em andamento: marcar séries, ajustar carga/reps e descansar entre as séries. */
export default function SessaoScreen() {
  const { workout, ready } = useActiveWorkout();
  const [rest, setRest] = useState<Rest | null>(null);
  const now = useNow(1000);

  if (!workout) {
    return (
      <ScreenLayout title="Treino" back="voltar">
        {ready && (
          <ScrollView contentContainerStyle={styles.content}>
            <EmptyState
              icon="barbell"
              title="Nenhum treino em andamento"
              description="Escolha uma ficha na tela Treinar para começar."
            />
          </ScrollView>
        )}
      </ScreenLayout>
    );
  }

  const { accent } = workout;
  const { done, total } = countSets(workout);
  const accentColor = colors.accent[accent][1];

  const toggleSet = (exerciseIndex: number, setIndex: number) => {
    const wasDone = workout.exercises[exerciseIndex].sets[setIndex].done;
    updateSet(exerciseIndex, setIndex, { done: !wasDone });
    if (!wasDone) setRest(startRest());
  };

  const adjustRest = (deltaSeconds: number) =>
    setRest((r) =>
      r && {
        endsAt: r.endsAt + deltaSeconds * 1000,
        totalSeconds: Math.max(1, r.totalSeconds + deltaSeconds),
      },
    );

  const finish = () => {
    const message =
      done === 0
        ? 'Nenhuma série foi marcada como feita. Finalizar mesmo assim?'
        : `Você fez ${done} de ${total} séries.`;
    confirmAction(
      'Finalizar treino?',
      message,
      'Finalizar',
      () => {
        const id = finishWorkout();
        if (id) router.replace({ pathname: '/treinar/resultado', params: { id } });
      },
      false,
    );
  };

  const discard = () =>
    confirmAction('Descartar treino?', 'As séries marcadas neste treino serão perdidas.', 'Descartar', () => {
      discardWorkout();
      router.back();
    });

  return (
    <ScreenLayout title={`Treino ${workout.label}`} back="voltar">
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <WiiText variant="label">Tempo</WiiText>
          <WiiText style={[styles.statusValue, { color: accentColor }]}>
            {formatDuration(now - workout.startedAt)}
          </WiiText>
        </View>
        <View style={styles.statusItem}>
          <WiiText variant="label">Séries</WiiText>
          <WiiText style={[styles.statusValue, { color: accentColor }]}>
            {done}/{total}
          </WiiText>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: accentColor }]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, rest && styles.contentWithTimer]}
        keyboardShouldPersistTaps="handled">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <WorkoutExerciseCard
            key={exercise.id}
            exercise={exercise}
            index={exerciseIndex}
            accent={accent}
            onChangeSet={(setIndex, patch) => updateSet(exerciseIndex, setIndex, patch)}
            onToggleSet={(setIndex) => toggleSet(exerciseIndex, setIndex)}
            onAddSet={() => addSet(exerciseIndex)}
            onRemoveSet={() => removeSet(exerciseIndex)}
          />
        ))}

        <WiiButton label="Finalizar treino" icon="flag" accent="green" onPress={finish} />
        <WiiButton label="Descartar treino" icon="trash" accent="red" variant="outline" onPress={discard} />
      </ScrollView>

      {rest && (
        <View style={styles.timer}>
          <RestTimer
            endsAt={rest.endsAt}
            totalSeconds={rest.totalSeconds}
            accent={accent}
            onAdjust={adjustRest}
            onClose={() => setRest(null)}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  contentWithTimer: { paddingBottom: 140 },
  statusBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 2,
    borderColor: colors.tileBorder,
  },
  statusItem: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  statusValue: { fontFamily: fonts.black, fontSize: 20 },
  progressTrack: {
    flexBasis: '100%',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.tileBottom,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  timer: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.sm },
});
