import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, radius, shadows, spacing } from '@/theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
};

/** Cartão de aviso para quando ainda não há nada para mostrar. */
export function EmptyState({ icon, title, description }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={48} color={colors.primary} />
      <WiiText variant="title">{title}</WiiText>
      <WiiText style={styles.description}>{description}</WiiText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  description: { textAlign: 'center', color: colors.textMuted },
});
