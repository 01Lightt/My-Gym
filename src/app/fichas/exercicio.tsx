import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { Stepper } from '@/components/Stepper';
import { WiiButton } from '@/components/WiiButton';
import { WiiInput } from '@/components/WiiInput';
import {
  deleteExercise,
  saveExercise,
  useRoutine,
  type Routine,
  type RoutineExercise,
} from '@/data/routines';
import { spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { formatWeight, parseWeight } from '@/utils/format';

/** Adicionar um exercício à ficha ou editar um existente (quando recebe ?exerciseId=). */
export default function ExercicioFormScreen() {
  const { routineId, exerciseId } = useLocalSearchParams<{ routineId: string; exerciseId?: string }>();
  const { routine, ready } = useRoutine(routineId);

  // Espera os dados carregarem para os campos já começarem preenchidos
  if (!ready) return <ScreenLayout title="Exercício" back="voltar">{null}</ScreenLayout>;
  return <ExercicioForm routine={routine} existing={routine?.exercises.find((e) => e.id === exerciseId)} />;
}

function ExercicioForm({ routine, existing }: { routine?: Routine; existing?: RoutineExercise }) {
  const accent = routine?.accent ?? 'blue';

  const [name, setName] = useState(existing?.name ?? '');
  const [sets, setSets] = useState(existing?.sets ?? 3);
  const [reps, setReps] = useState(existing?.reps ?? '12');
  const [weight, setWeight] = useState(existing?.weightKg != null ? formatWeight(existing.weightKg) : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const canSave = routine != null && name.trim().length > 0;

  const save = () => {
    if (!routine) return;
    saveExercise(
      routine.id,
      { name: name.trim(), sets, reps: reps.trim(), weightKg: parseWeight(weight), notes: notes.trim() },
      existing?.id,
    );
    router.back();
  };

  const remove = () => {
    if (!routine || !existing) return;
    confirmAction('Excluir exercício?', `"${existing.name}" será removido da ficha.`, 'Excluir', () => {
      deleteExercise(routine.id, existing.id);
      router.back();
    });
  };

  return (
    <ScreenLayout title={existing ? 'Editar exercício' : 'Novo exercício'} back="voltar">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <WiiInput
          label="Exercício"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Supino reto"
          autoFocus={!existing}
        />

        <View style={styles.row}>
          <Stepper label="Séries" value={sets} onChange={setSets} accent={accent} />
          <View style={styles.flex}>
            <WiiInput label="Repetições" value={reps} onChangeText={setReps} placeholder="Ex.: 10-12" />
          </View>
        </View>

        <WiiInput
          label="Carga sugerida (kg)"
          value={weight}
          onChangeText={setWeight}
          placeholder="Opcional"
          keyboardType="decimal-pad"
        />

        <WiiInput
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex.: pegada fechada, drop-set na última"
          multiline
        />

        <WiiButton label="Salvar" icon="checkmark" accent="green" onPress={save} disabled={!canSave} />
        {existing && (
          <WiiButton label="Excluir exercício" icon="trash" accent="red" variant="outline" onPress={remove} />
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.lg },
  // Alinha pelo topo para os títulos "Séries" e "Repetições" ficarem na mesma altura
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  flex: { flex: 1 },
});
