import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, radius, shadows, spacing } from '@/theme';

/** Aviso temporário para telas que ainda vão ser construídas. */
export function ComingSoon({ description }: { description: string }) {
  return (
    <View style={styles.card}>
      <Ionicons name="construct" size={48} color={colors.primary} />
      <WiiText variant="title">Em construção</WiiText>
      <WiiText style={styles.description}>{description}</WiiText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  description: { textAlign: 'center', color: colors.textMuted },
});
