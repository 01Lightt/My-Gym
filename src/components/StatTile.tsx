import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, shadows, spacing, type AccentName } from '@/theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  accent: AccentName;
};

/** Bloco com um número em destaque (usado na tela de resultado). */
export function StatTile({ icon, label, value, accent }: Props) {
  return (
    <View style={styles.tile}>
      <GlossyBubble accent={accent} size={44}>
        <Ionicons name={icon} size={24} color={colors.textOnColor} />
      </GlossyBubble>
      <WiiText style={[styles.value, { color: colors.accent[accent][1] }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </WiiText>
      <WiiText variant="label">{label}</WiiText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileTop,
    boxShadow: shadows.tile,
  },
  value: { fontFamily: fonts.black, fontSize: 28, lineHeight: 34 },
});
