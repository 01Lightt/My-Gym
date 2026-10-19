import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = { title?: string; subtitle?: string; style?: StyleProp<ViewStyle>; children: ReactNode };

/** Cartão branco arredondado com título opcional. */
export function Card({ title, subtitle, style, children }: Props) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View>
          {title && <WiiText style={styles.title}>{title}</WiiText>}
          {subtitle && <WiiText variant="label">{subtitle}</WiiText>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  title: { fontFamily: fonts.bold, fontSize: 19 },
});
