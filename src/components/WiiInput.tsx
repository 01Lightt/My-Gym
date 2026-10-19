import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = TextInputProps & { label: string; hint?: string };

/** Campo de texto arredondado com título, que acende em azul quando está em foco. */
export function WiiInput({ label, hint, style, onFocus, onBlur, multiline, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <WiiText style={styles.label}>{label}</WiiText>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {hint && <WiiText variant="label">{hint}</WiiText>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.bold, fontSize: 15, marginLeft: spacing.xs },
  input: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.tileTop,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    outlineWidth: 0,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  focused: { borderColor: colors.primary },
});
