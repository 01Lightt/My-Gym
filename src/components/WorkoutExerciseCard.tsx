import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import type { WorkoutExercise, WorkoutSet } from '@/data/workouts';
import { colors, fonts, radius, shadows, spacing, type AccentName } from '@/theme';
import { formatWeight, parseReps, parseWeight } from '@/utils/format';

type Props = {
  exercise: WorkoutExercise;
  index: number;
  accent: AccentName;
  onChangeSet: (setIndex: number, patch: Partial<WorkoutSet>) => void;
  onToggleSet: (setIndex: number) => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
};

/** Um exercício durante o treino: uma linha por série com carga, repetições e o botão de "feito". */
export function WorkoutExerciseCard({
  exercise,
  index,
  accent,
  onChangeSet,
  onToggleSet,
  onAddSet,
  onRemoveSet,
}: Props) {
  const doneCount = exercise.sets.filter((set) => set.done).length;
  const allDone = doneCount === exercise.sets.length;

  return (
    <View style={[styles.card, allDone && { borderColor: colors.accent[accent][1] }]}>
      <View style={styles.header}>
        <GlossyBubble accent={accent} size={38}>
          {allDone ? (
            <Ionicons name="checkmark" size={22} color={colors.textOnColor} />
          ) : (
            <WiiText style={styles.number}>{index + 1}</WiiText>
          )}
        </GlossyBubble>
        <View style={styles.titleBox}>
          <WiiText style={styles.name}>{exercise.name}</WiiText>
          <WiiText variant="label">
            Meta: {exercise.targetSets} × {exercise.targetReps || '—'}
          </WiiText>
        </View>
        <WiiText style={[styles.counter, { color: colors.accent[accent][1] }]}>
          {doneCount}/{exercise.sets.length}
        </WiiText>
      </View>

      {exercise.notes ? (
        <View style={styles.notes}>
          <Ionicons name="chatbubble-ellipses" size={14} color={colors.textMuted} />
          <WiiText variant="label" style={styles.flex}>
            {exercise.notes}
          </WiiText>
        </View>
      ) : null}

      <View style={styles.columns}>
        <WiiText variant="label" style={styles.colSet}>
          Série
        </WiiText>
        <WiiText variant="label" style={styles.colInput}>
          kg
        </WiiText>
        <WiiText variant="label" style={styles.colInput}>
          reps
        </WiiText>
        <View style={styles.colCheck} />
      </View>

      {exercise.sets.map((set, setIndex) => (
        <SetRow
          key={setIndex}
          index={setIndex}
          set={set}
          accent={accent}
          onChange={(patch) => onChangeSet(setIndex, patch)}
          onToggle={() => onToggleSet(setIndex)}
        />
      ))}

      <View style={styles.actions}>
        <WiiButton
          label="Série"
          icon="remove"
          variant="outline"
          accent={accent}
          onPress={onRemoveSet}
          disabled={exercise.sets.length <= 1}
          containerStyle={styles.flex}
        />
        <WiiButton
          label="Série"
          icon="add"
          variant="outline"
          accent={accent}
          onPress={onAddSet}
          containerStyle={styles.flex}
        />
      </View>
    </View>
  );
}

type SetRowProps = {
  index: number;
  set: WorkoutSet;
  accent: AccentName;
  onChange: (patch: Partial<WorkoutSet>) => void;
  onToggle: () => void;
};

function SetRow({ index, set, accent, onChange, onToggle }: SetRowProps) {
  // Texto local para permitir digitar valores intermediários como "22,"
  const [weight, setWeight] = useState(set.weightKg != null ? formatWeight(set.weightKg) : '');
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : '');

  return (
    <View style={[styles.setRow, set.done && { backgroundColor: `${colors.accent[accent][0]}33` }]}>
      <WiiText style={[styles.colSet, styles.setNumber]}>{index + 1}</WiiText>
      <TextInput
        style={[styles.colInput, styles.input]}
        value={weight}
        onChangeText={(text) => {
          setWeight(text);
          onChange({ weightKg: parseWeight(text) });
        }}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textMuted}
        selectTextOnFocus
      />
      <TextInput
        style={[styles.colInput, styles.input]}
        value={reps}
        onChangeText={(text) => {
          setReps(text);
          onChange({ reps: parseReps(text) });
        }}
        keyboardType="number-pad"
        placeholder="—"
        placeholderTextColor={colors.textMuted}
        selectTextOnFocus
      />
      <View style={styles.colCheck}>
        <BouncyPressable onPress={onToggle} hitSlop={6}>
          {set.done ? (
            <GlossyBubble accent={accent} size={42}>
              <Ionicons name="checkmark" size={26} color={colors.textOnColor} />
            </GlossyBubble>
          ) : (
            <View style={styles.checkEmpty}>
              <Ionicons name="checkmark" size={24} color={colors.tileBorder} />
            </View>
          )}
        </BouncyPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4 },
  number: { fontFamily: fonts.black, fontSize: 18, color: colors.textOnColor },
  titleBox: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 19 },
  counter: { fontFamily: fonts.black, fontSize: 20 },
  notes: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  flex: { flex: 1 },
  columns: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  colSet: { width: 44, textAlign: 'center' },
  colInput: { flex: 1, flexBasis: 0, minWidth: 0, marginHorizontal: spacing.xs, textAlign: 'center' },
  colCheck: { width: 52, alignItems: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  setNumber: { fontFamily: fonts.black, fontSize: 18, color: colors.textMuted },
  input: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.tileBottom,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    outlineWidth: 0,
  },
  checkEmpty: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tileTop,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
