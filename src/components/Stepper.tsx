import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, spacing, type AccentName } from '@/theme';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accent?: AccentName;
};

/** Contador com botões redondos de − e +. */
export function Stepper({ label, value, onChange, min = 1, max = 20, accent = 'blue' }: Props) {
  return (
    <View style={styles.field}>
      <WiiText style={styles.label}>{label}</WiiText>
      <View style={styles.row}>
        <BouncyPressable onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
          <GlossyBubble accent={accent} size={48} style={value <= min && styles.disabled}>
            <Ionicons name="remove" size={26} color={colors.textOnColor} />
          </GlossyBubble>
        </BouncyPressable>
        <WiiText style={styles.value}>{value}</WiiText>
        <BouncyPressable onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
          <GlossyBubble accent={accent} size={48} style={value >= max && styles.disabled}>
            <Ionicons name="add" size={26} color={colors.textOnColor} />
          </GlossyBubble>
        </BouncyPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.bold, fontSize: 15, marginLeft: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  value: { fontFamily: fonts.black, fontSize: 32, minWidth: 48, textAlign: 'center' },
  disabled: { opacity: 0.4 },
});
