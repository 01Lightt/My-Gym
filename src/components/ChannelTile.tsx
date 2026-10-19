import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import type { Channel } from '@/config/channels';
import { colors, radius, shadows, spacing } from '@/theme';

/** Um bloco do menu principal, no formato dos canais do Wii. */
export function ChannelTile({ channel }: { channel: Channel }) {
  return (
    <BouncyPressable
      containerStyle={styles.container}
      style={styles.tile}
      onPress={() => router.push(channel.route)}>
      <LinearGradient colors={[colors.tileTop, colors.tileBottom]} style={styles.inner}>
        <GlossyBubble accent={channel.accent} size={76} style={styles.bubble}>
          <Ionicons name={channel.icon} size={38} color={colors.textOnColor} />
        </GlossyBubble>
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
  bubble: { marginBottom: spacing.sm },
  title: { fontSize: 20 },
});
