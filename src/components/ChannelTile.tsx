import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiText } from '@/components/WiiText';
import type { Channel } from '@/config/channels';
import { colors, radius, shadows, spacing } from '@/theme';

/** Um bloco do menu principal, no formato dos canais do Wii. */
export function ChannelTile({ channel }: { channel: Channel }) {
  const accent = colors.accent[channel.accent];

  return (
    <BouncyPressable
      containerStyle={styles.container}
      style={styles.tile}
      onPress={() => router.push(channel.route)}>
      <LinearGradient colors={[colors.tileTop, colors.tileBottom]} style={styles.inner}>
        <LinearGradient colors={accent} style={styles.iconBubble}>
          <View style={styles.gloss} />
          <Ionicons name={channel.icon} size={38} color={colors.textOnColor} />
        </LinearGradient>
        <WiiText variant="title" style={styles.title}>
          {channel.title}
        </WiiText>
        <WiiText variant="label">{channel.subtitle}</WiiText>
      </LinearGradient>
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tile: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    boxShadow: shadows.tile,
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    boxShadow: shadows.button,
    overflow: 'hidden',
  },
  // Brilho no topo da bolha, dando o aspecto "plástico" do Wii
  gloss: {
    position: 'absolute',
    top: 4,
    left: 10,
    right: 10,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  title: { fontSize: 20 },
});
