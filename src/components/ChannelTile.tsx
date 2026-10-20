import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { WiiMark } from '@/components/WiiMark';
import { WiiText } from '@/components/WiiText';
import type { Channel } from '@/config/channels';
import { colors, fonts, radius, shadows } from '@/theme';

type Size = { width: number; height: number };

/** Espessura da moldura em relevo em volta da cor do canal. */
const FRAME = 6;

/**
 * Um canal do menu: a cor ocupa o bloco, com o nome no topo e o ícone grande no meio.
 * Fica dentro de uma moldura cinza em relevo e leva um reflexo de vidro curvo por cima,
 * como os botões do Wii (ex.: o da chave de configurações).
 */
export function ChannelTile({ channel, size }: { channel: Channel; size: Size }) {
  return (
    <BouncyPressable style={[styles.tile, size]} onPress={() => router.push(channel.route)}>
      <LinearGradient
        colors={colors.channelFrame}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.35, y: 1 }}
        style={styles.frame}>
        <LinearGradient colors={colors.accent[channel.accent]} style={styles.content}>
          {/* Reflexo curvo: faixa clara arredondada que cobre a metade de cima */}
          <View
            pointerEvents="none"
            style={[
              styles.reflection,
              { top: -size.height * 0.45, height: size.height * 0.95, borderRadius: size.width },
            ]}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
            style={styles.topShine}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.14)']}
            style={styles.bottomShade}
          />

          <WiiText style={styles.title} numberOfLines={1}>
            {channel.title}
          </WiiText>
          <Ionicons
            name={channel.icon}
            size={Math.min(size.height * 0.4, size.width * 0.36)}
            color={colors.textOnColor}
            style={styles.icon}
          />
        </LinearGradient>
      </LinearGradient>
    </BouncyPressable>
  );
}

/** Espaço vazio da grade: bloco cinza claro, contorno fino e "Wii" em relevo, como no Menu do Wii. */
export function EmptyChannelTile({ size }: { size: Size }) {
  return (
    <View style={[styles.empty, size]}>
      <LinearGradient colors={colors.emptySlot} style={styles.emptyContent}>
        <View style={styles.emptyShine} />
        <WiiMark height={Math.min(size.height * 0.2, size.width * 0.16)} color={colors.emptySlotText} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.channel + 2,
    borderWidth: 1,
    borderColor: '#B7BBBB',
    boxShadow: shadows.channel,
    overflow: 'hidden',
  },
  frame: { flex: 1, padding: FRAME },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.channel - 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
  },
  reflection: {
    position: 'absolute',
    left: '-20%',
    width: '140%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  topShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '28%' },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%' },
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
  empty: {
    borderRadius: radius.channel,
    borderWidth: 1.5,
    borderColor: colors.emptySlotBorder,
    overflow: 'hidden',
  },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Fio claro logo abaixo da borda de cima (o "brilho" do slot no original)
  emptyShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
