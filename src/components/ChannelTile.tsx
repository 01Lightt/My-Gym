import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiText } from '@/components/WiiText';
import { EMPTY_SLOT_LABEL, type Channel } from '@/config/channels';
import { colors, fonts, radius, shadows } from '@/theme';

type Size = { width: number; height: number };

/**
 * Um canal do menu, como no Menu do Wii: a cor ocupa o bloco inteiro,
 * o nome fica no topo e o ícone grande no meio, com um brilho de vidro por cima.
 */
export function ChannelTile({ channel, size }: { channel: Channel; size: Size }) {
  return (
    <BouncyPressable style={[styles.frame, size]} onPress={() => router.push(channel.route)}>
      <LinearGradient colors={colors.accent[channel.accent]} style={styles.content}>
        <WiiText style={styles.title} numberOfLines={1}>
          {channel.title}
        </WiiText>
        <Ionicons
          name={channel.icon}
          size={Math.min(size.height * 0.42, size.width * 0.38)}
          color={colors.textOnColor}
          style={styles.icon}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
          style={styles.gloss}
        />
      </LinearGradient>
    </BouncyPressable>
  );
}

/** Espaço vazio da grade: bloco cinza com "Wii" em relevo, como os slots livres do Menu do Wii. */
export function EmptyChannelTile({ size }: { size: Size }) {
  return (
    <View style={[styles.frame, styles.emptyFrame, size]}>
      <LinearGradient colors={colors.emptySlot} style={styles.content}>
        <WiiText style={[styles.emptyText, { fontSize: Math.min(size.height * 0.24, size.width * 0.2) }]}>
          {EMPTY_SLOT_LABEL}
        </WiiText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.channel,
    borderWidth: 2,
    borderColor: colors.tileTop,
    boxShadow: shadows.channel,
    overflow: 'hidden',
  },
  emptyFrame: { borderColor: colors.emptySlotBorder, boxShadow: 'none' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    position: 'absolute',
    top: 6,
    left: 8,
    right: 8,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textOnColor,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  icon: { marginTop: 14 },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  emptyText: {
    fontFamily: fonts.black,
    color: colors.emptySlotText,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 0,
  },
});
