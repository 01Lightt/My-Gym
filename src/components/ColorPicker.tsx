import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, spacing, type AccentName } from '@/theme';

const ACCENTS = Object.keys(colors.accent) as AccentName[];

type Props = { label: string; value: AccentName; onChange: (accent: AccentName) => void };

/** Escolha de cor com bolhas — as opções vêm automaticamente de `colors.accent` no tema. */
export function ColorPicker({ label, value, onChange }: Props) {
  return (
    <View style={styles.field}>
      <WiiText style={styles.label}>{label}</WiiText>
      <View style={styles.row}>
        {ACCENTS.map((accent) => {
          const selected = accent === value;
          return (
            <BouncyPressable key={accent} onPress={() => onChange(accent)}>
              <GlossyBubble accent={accent} size={40} style={selected && styles.selected}>
                {selected && <Ionicons name="checkmark" size={24} color={colors.textOnColor} />}
              </GlossyBubble>
            </BouncyPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.bold, fontSize: 15, marginLeft: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  selected: { borderWidth: 3, borderColor: colors.textOnColor, transform: [{ scale: 1.15 }] },
});
