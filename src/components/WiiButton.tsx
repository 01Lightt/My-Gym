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
  /** Cor do ícone (e do texto, quando for vermelho/excluir). */
  accent?: AccentName;
  /** solid = ação principal (contorno ciano); outline = ação secundária (contorno cinza). */
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Botão no estilo do Wii (como o botão "Menu do Wii" dos canais):
 * branco, texto cinza e contorno azul-ciano. A cor da ação aparece só no ícone.
 */
export function WiiButton({
  label,
  onPress,
  icon,
  accent = 'blue',
  variant = 'solid',
  disabled,
  containerStyle,
}: Props) {
  const primary = variant === 'solid';
  const accentColor = colors.accent[accent][1];
  const textColor = accent === 'red' ? colors.danger : colors.text;

  return (
    <BouncyPressable
      containerStyle={containerStyle}
      style={[styles.button, primary ? styles.primary : styles.secondary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <LinearGradient colors={[colors.tileTop, colors.tileBottom]} style={styles.inner}>
        {icon && <Ionicons name={icon} size={21} color={accentColor} />}
        <WiiText style={[styles.label, { color: textColor }]}>{label}</WiiText>
      </LinearGradient>
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  primary: { borderColor: colors.primary, boxShadow: shadows.glow },
  secondary: { borderColor: colors.tileBorder, boxShadow: shadows.button },
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
