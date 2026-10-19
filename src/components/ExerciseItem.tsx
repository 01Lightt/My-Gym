import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import type { RoutineExercise } from '@/data/routines';
import { colors, fonts, radius, shadows, spacing, type AccentName } from '@/theme';
import { formatWeight } from '@/utils/format';

type Props = {
  exercise: RoutineExercise;
  index: number;
  accent: AccentName;
  onPress: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

/** Um exercício da ficha: número, nome, "chips" com séries/reps/carga e observações. */
export function ExerciseItem({ exercise, index, accent, onPress, onMoveUp, onMoveDown }: Props) {
  const accentColor = colors.accent[accent][1];

  return (
    <BouncyPressable style={styles.card} onPress={onPress}>
      <GlossyBubble accent={accent} size={40}>
        <WiiText style={styles.number}>{index + 1}</WiiText>
      </GlossyBubble>

      <View style={styles.info}>
        <WiiText style={styles.name}>{exercise.name}</WiiText>
        <View style={styles.chips}>
          <Chip icon="layers" text={`${exercise.sets} séries`} color={accentColor} />
          {exercise.reps ? <Chip icon="repeat" text={`${exercise.reps} reps`} color={accentColor} /> : null}
          {exercise.weightKg != null && (
            <Chip icon="barbell" text={`${formatWeight(exercise.weightKg)} kg`} color={accentColor} />
          )}
        </View>
        {exercise.notes ? (
          <View style={styles.notes}>
            <Ionicons name="chatbubble-ellipses" size={14} color={colors.textMuted} />
            <WiiText variant="label" style={styles.notesText}>
              {exercise.notes}
            </WiiText>
          </View>
        ) : null}
      </View>

      <View style={styles.arrows}>
        <ArrowButton icon="chevron-up" onPress={onMoveUp} />
        <ArrowButton icon="chevron-down" onPress={onMoveDown} />
      </View>
    </BouncyPressable>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

function Chip({ icon, text, color }: { icon: IconName; text: string; color: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={color} />
      <WiiText style={[styles.chipText, { color }]}>{text}</WiiText>
    </View>
  );
}

/** Setinha para reordenar; fica apagada quando não dá para mover. */
function ArrowButton({ icon, onPress }: { icon: IconName; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} hitSlop={6} style={styles.arrow}>
      <Ionicons name={icon} size={22} color={onPress ? colors.textMuted : colors.tileBorder} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  number: { fontFamily: fonts.black, fontSize: 18, color: colors.textOnColor },
  info: { flex: 1, gap: spacing.xs },
  name: { fontFamily: fonts.bold, fontSize: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.tileBottom,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 13 },
  notes: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  notesText: { flex: 1 },
  arrows: { gap: spacing.sm },
  arrow: { padding: 2 },
});
