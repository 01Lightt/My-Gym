import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WiiBackground } from '@/components/WiiBackground';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { colors, spacing } from '@/theme';

/** Altura aproximada do botão Menu/Voltar com o respiro em volta. */
const FOOTER_HEIGHT = 84;

type Props = {
  title: string;
  /** "menu" volta para o menu principal; "voltar" volta uma tela. */
  back?: 'menu' | 'voltar';
  children: ReactNode;
};

/**
 * Espaço que o botão flutuante ocupa embaixo da tela. Use para o conteúdo não ficar escondido
 * atrás dele (ex.: algo posicionado no rodapé).
 */
export function useFooterSpace() {
  const insets = useSafeAreaInsets();
  return FOOTER_HEIGHT + insets.bottom;
}

/** ScrollView das telas internas: deixa espaço no fim para rolar o conteúdo acima do botão flutuante. */
export function ScreenScrollView({ contentContainerStyle, ...rest }: ScrollViewProps) {
  const footerSpace = useFooterSpace();
  const ownPadding = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;
  const extra = typeof ownPadding === 'number' ? ownPadding : 0;
  return <ScrollView contentContainerStyle={[contentContainerStyle, { paddingBottom: extra + footerSpace }]} {...rest} />;
}

/**
 * Layout padrão das telas internas: título no topo e o botão Menu/Voltar em pílula
 * flutuando por cima do conteúdo (sem faixa de fundo atrás), como nos canais do Wii.
 */
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

      <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
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
  // Flutua por cima do conteúdo, sem fundo
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
});
