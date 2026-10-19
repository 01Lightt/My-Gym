import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseItem } from '@/components/ExerciseItem';
import { RoutineCard } from '@/components/RoutineCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { moveExercise, useRoutine } from '@/data/routines';
import { spacing } from '@/theme';

/** Detalhes de uma ficha: resumo no topo e a lista de exercícios. */
export default function FichaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routine, ready } = useRoutine(id);

  if (!routine) {
    return (
      <ScreenLayout title="Ficha" back="voltar">
        {ready && (
          <ScrollView contentContainerStyle={styles.content}>
            <EmptyState icon="help-circle" title="Ficha não encontrada" description="Ela pode ter sido excluída." />
          </ScrollView>
        )}
      </ScreenLayout>
    );
  }

  const { exercises, accent } = routine;
  const openExercise = (exerciseId?: string) =>
    router.push({
      pathname: '/fichas/exercicio',
      params: exerciseId ? { routineId: routine.id, exerciseId } : { routineId: routine.id },
    });

  return (
    <ScreenLayout title={`Ficha ${routine.label}`} back="voltar">
      <ScrollView contentContainerStyle={styles.content}>
        <RoutineCard routine={routine} />
        <WiiButton
          label="Editar ficha"
          icon="pencil"
          variant="outline"
          accent={accent}
          onPress={() => router.push({ pathname: '/fichas/form', params: { id: routine.id } })}
        />

        <WiiText variant="title" style={styles.section}>
          Exercícios
        </WiiText>

        {exercises.length === 0 && (
          <EmptyState
            icon="barbell"
            title="Sem exercícios"
            description="Adicione o primeiro exercício desta ficha."
          />
        )}

        {exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            index={index}
            accent={accent}
            onPress={() => openExercise(exercise.id)}
            onMoveUp={index > 0 ? () => moveExercise(routine.id, exercise.id, -1) : undefined}
            onMoveDown={
              index < exercises.length - 1 ? () => moveExercise(routine.id, exercise.id, 1) : undefined
            }
          />
        ))}

        <WiiButton label="Adicionar exercício" icon="add" accent={accent} onPress={() => openExercise()} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  section: { marginTop: spacing.sm, marginLeft: spacing.xs },
});
