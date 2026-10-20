import { ScrollView, StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Rola na horizontal quando há muitas opções (ex.: lista de exercícios). */
  scrollable?: boolean;
};

/** Grupo de botões em pílula onde só um fica ativo (filtros de período, métrica, exercício). */
export function SegmentedPills<T extends string>({ options, value, onChange, scrollable }: Props<T>) {
  const pills = options.map((option) => {
    const active = option.value === value;
    return (
      <BouncyPressable
        key={option.value}
        onPress={() => onChange(option.value)}
        style={[styles.pill, active && styles.active]}
        containerStyle={!scrollable && styles.grow}>
        <WiiText style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
          {option.label}
        </WiiText>
      </BouncyPressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {pills}
      </ScrollView>
    );
  }
  return <View style={styles.row}>{pills}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 2 },
  grow: { flex: 1 },
  pill: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  // Selecionado no estilo Wii: fundo azul bem claro, contorno e brilho ciano
  active: { backgroundColor: colors.primaryLight, borderColor: colors.primary, boxShadow: shadows.glow },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.textMuted },
  activeLabel: { color: colors.text },
});
