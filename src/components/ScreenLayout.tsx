import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WiiBackground } from '@/components/WiiBackground';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  /** "menu" volta para o menu principal; "voltar" volta uma tela. */
  back?: 'menu' | 'voltar';
  children: ReactNode;
};

/** Layout padrão das telas internas: título no topo e botão em pílula embaixo, como nos canais do Wii. */
export function ScreenLayout({ title, back = 'menu', children }: Props) {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (back === 'menu') router.dismissTo('/');
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <WiiBackground>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <WiiText variant="title" style={styles.title} numberOfLines={1}>
          {title}
        </WiiText>
      </View>
      <View style={styles.headerShine} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'web' ? undefined : 'padding'}>
        {children}
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <WiiButton
          label={back === 'menu' ? 'Menu' : 'Voltar'}
          icon={back === 'menu' ? 'home' : 'arrow-back'}
          onPress={goBack}
        />
      </View>
    </WiiBackground>
  );
}

const styles = StyleSheet.create({
  // Faixa clara com a linha azul-ciano embaixo, como a barra do Menu do Wii
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 2.5,
    borderColor: colors.barLine,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  headerShine: { height: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  title: { color: colors.text, fontSize: 26 },
  content: { flex: 1 },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
});
