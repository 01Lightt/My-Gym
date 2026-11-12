import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenLayout, ScreenScrollView } from '@/components/ScreenLayout';
import { SegmentedPills } from '@/components/SegmentedPills';
import { Stepper } from '@/components/Stepper';
import { WiiButton } from '@/components/WiiButton';
import { WiiInput } from '@/components/WiiInput';
import { WiiText } from '@/components/WiiText';
import {
  deleteExercise,
  exerciseMode,
  saveExercise,
  useRoutine,
  type ExerciseMode,
  type Routine,
  type RoutineExercise,
} from '@/data/routines';
import { fonts, spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { formatWeight, parseSeconds, parseWeight } from '@/utils/format';

/**
 * Opções de "Medir por". "Tempo" é para exercícios sem carga medidos em segundos (prancha, isometria):
 * a ficha pede o tempo por série no lugar de repetições e carga.
 */
const MODES: { value: ExerciseMode; label: string }[] = [
  { value: 'weight', label: 'Peso e reps' },
  { value: 'time', label: 'Tempo' },
];

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
  const [mode, setMode] = useState<ExerciseMode>(existing ? exerciseMode(existing) : 'weight');
  const [sets, setSets] = useState(existing?.sets ?? 3);
  // Um exercício por tempo não tem repetições salvas: se trocar para "Peso e reps", começa com 12
  const [reps, setReps] = useState(
    existing && exerciseMode(existing) === 'weight' ? existing.reps : '12',
  );
  const [weight, setWeight] = useState(existing?.weightKg != null ? formatWeight(existing.weightKg) : '');
  // Tempo por série em segundos (modo "Tempo"); começa em 30 s ao trocar um exercício para tempo
  const [duration, setDuration] = useState(existing?.durationSec != null ? String(existing.durationSec) : '30');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const timed = mode === 'time';
  const canSave = routine != null && name.trim().length > 0;

  const save = () => {
    if (!routine) return;
    saveExercise(
      routine.id,
      {
        name: name.trim(),
        mode,
        sets,
        // Exercício por tempo não leva carga nem repetições
        reps: timed ? '' : reps.trim(),
        weightKg: timed ? null : parseWeight(weight),
        durationSec: timed ? parseSeconds(duration) : null,
        notes: notes.trim(),
      },
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
      <ScreenScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <WiiInput
          label="Exercício"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Supino reto"
          autoFocus={!existing}
        />

        <View style={styles.field}>
          <WiiText style={styles.fieldLabel}>Medir por</WiiText>
          <SegmentedPills options={MODES} value={mode} onChange={setMode} />
        </View>

        <View style={styles.row}>
          <Stepper label="Séries" value={sets} onChange={setSets} accent={accent} />
          <View style={styles.flex}>
            {timed ? (
              <WiiInput
                label="Tempo (seg)"
                value={duration}
                // Só números: o teclado numérico do Android não tem ":" (por isso o tempo é em segundos)
                onChangeText={(text) => setDuration(text.replace(/\D/g, ''))}
                placeholder="Ex.: 45"
                keyboardType="number-pad"
                maxLength={4}
              />
            ) : (
              <WiiInput label="Repetições" value={reps} onChangeText={setReps} placeholder="Ex.: 10-12" />
            )}
          </View>
        </View>

        {!timed && (
          <WiiInput
            label="Carga sugerida (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="Opcional"
            keyboardType="decimal-pad"
          />
        )}

        <WiiInput
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder={timed ? 'Ex.: prancha com os cotovelos no chão' : 'Ex.: pegada fechada, drop-set na última'}
          multiline
        />

        <WiiButton label="Salvar" icon="checkmark" accent="green" onPress={save} disabled={!canSave} />
        {existing && (
          <WiiButton label="Excluir exercício" icon="trash" accent="red" variant="outline" onPress={remove} />
        )}
      </ScreenScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.lg },
  field: { gap: spacing.xs },
  // Mesmo estilo do título dos campos (WiiInput)
  fieldLabel: { fontFamily: fonts.bold, fontSize: 15, marginLeft: spacing.xs },
  // Alinha pelo topo para os títulos "Séries" e "Repetições" ficarem na mesma altura
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  flex: { flex: 1 },
});
