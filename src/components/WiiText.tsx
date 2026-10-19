import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme';

type Variant = 'body' | 'label' | 'title' | 'display';

type Props = TextProps & { variant?: Variant };

/** Texto padrão do app, já com a fonte arredondada do tema. */
export function WiiText({ variant = 'body', style, ...rest }: Props) {
  return <Text style={[styles.base, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontFamily: fonts.regular,
  },
  body: { fontSize: 16 },
  label: { fontSize: 13, color: colors.textMuted },
  title: { fontSize: 24, fontFamily: fonts.bold },
  display: { fontSize: 44, fontFamily: fonts.black },
});
