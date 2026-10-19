import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiBackground } from '@/components/WiiBackground';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type Props = { title: string; children: ReactNode };

/** Layout padrão das telas internas: título no topo e botão "Menu" em pílula embaixo, como nos canais do Wii. */
export function ScreenLayout({ title, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <WiiBackground>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <WiiText variant="title" style={styles.title}>
          {title}
        </WiiText>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <BouncyPressable style={styles.menuButton} onPress={() => router.back()}>
          <LinearGradient
            colors={[colors.accent.blue[0], colors.accent.blue[1]]}
            style={styles.menuButtonInner}>
            <Ionicons name="home" size={20} color={colors.textOnColor} />
            <WiiText style={styles.menuButtonText}>Menu</WiiText>
          </LinearGradient>
        </BouncyPressable>
      </View>
    </WiiBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  title: { color: colors.primaryDark, fontSize: 28 },
  content: { flex: 1, padding: spacing.md },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
  menuButton: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.textOnColor,
    boxShadow: shadows.button,
    overflow: 'hidden',
  },
  menuButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
  },
  menuButtonText: { color: colors.textOnColor, fontFamily: fonts.bold, fontSize: 18 },
});
