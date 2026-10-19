import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import type { RoutineInput, RoutineExercise } from '@/data/routines';
import { colors, fonts, radius, shadows, spacing } from '@/theme';
import { plural } from '@/utils/format';

type Props = {
  routine: RoutineInput & { exercises: RoutineExercise[] };
  onPress?: () => void;
};

/** Cartão grande de uma ficha: letra em destaque na cor escolhida + resumo dos exercícios. */
export function RoutineCard({ routine, onPress }: Props) {
  const { label, name, accent, exercises } = routine;
  const preview = exercises.map((e) => e.name).join(' · ');

  return (
    <BouncyPressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <GlossyBubble accent={accent} size={78} shape="rounded">
        <WiiText style={styles.letter} numberOfLines={1} adjustsFontSizeToFit>
          {label || '?'}
        </WiiText>
      </GlossyBubble>

      <View style={styles.info}>
        <WiiText variant="title" style={styles.name} numberOfLines={1}>
          {name || `Treino ${label}`}
        </WiiText>
        <WiiText style={[styles.count, { color: colors.accent[accent][1] }]}>
          {plural(exercises.length, 'exercício', 'exercícios')}
        </WiiText>
        {preview ? (
          <WiiText variant="label" numberOfLines={1}>
            {preview}
          </WiiText>
        ) : null}
      </View>

      {onPress && <Ionicons name="chevron-forward" size={26} color={colors.tileBorder} />}
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  letter: {
    fontFamily: fonts.black,
    fontSize: 40,
    color: colors.textOnColor,
    paddingHorizontal: spacing.xs,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 21 },
  count: { fontFamily: fonts.bold, fontSize: 14 },
});
