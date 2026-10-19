import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, shadows, spacing, type AccentName } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  accent?: AccentName;
  /** solid = preenchido com a cor; outline = fundo branco com texto colorido. */
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Botão em pílula no estilo Wii. */
export function WiiButton({
  label,
  onPress,
  icon,
  accent = 'blue',
  variant = 'solid',
  disabled,
  containerStyle,
}: Props) {
  const solid = variant === 'solid';
  const gradient = solid ? colors.accent[accent] : ([colors.tileTop, colors.tileBottom] as const);
  const textColor = solid ? colors.textOnColor : colors.accent[accent][1];

  return (
    <BouncyPressable
      containerStyle={containerStyle}
      style={[styles.button, solid ? styles.solid : styles.outline, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <LinearGradient colors={gradient} style={styles.inner}>
        {icon && <Ionicons name={icon} size={20} color={textColor} />}
        <WiiText style={[styles.label, { color: textColor }]}>{label}</WiiText>
      </LinearGradient>
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    borderWidth: 2,
    boxShadow: shadows.button,
    overflow: 'hidden',
  },
  solid: { borderColor: colors.textOnColor },
  outline: { borderColor: colors.tileBorder, boxShadow: shadows.tile },
  disabled: { opacity: 0.45 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
  },
  label: { fontFamily: fonts.bold, fontSize: 17 },
});
