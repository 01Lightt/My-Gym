import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import { REST_DONE_MESSAGE_MS, REST_STEP_SECONDS } from '@/config/workout';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, radius, shadows, spacing, type AccentName } from '@/theme';
import { formatDuration } from '@/utils/format';

type Props = {
  /** Momento (ms) em que o descanso termina. */
  endsAt: number;
  /** Duração total do descanso (s), para a barra de progresso. */
  totalSeconds: number;
  accent: AccentName;
  onAdjust: (deltaSeconds: number) => void;
  onClose: () => void;
};

/** Cartão flutuante com a contagem regressiva do descanso. Vibra ao terminar. */
export function RestTimer({ endsAt, totalSeconds, accent, onAdjust, onClose }: Props) {
  const now = useNow(250);
  const remainingMs = Math.max(0, endsAt - now);
  const finished = remainingMs === 0;
  const progress = Math.min(1, remainingMs / (totalSeconds * 1000));

  // Guarda o onClose mais recente sem reiniciar o efeito a cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!finished) return;
    Vibration.vibrate([0, 400, 200, 400]);
    const id = setTimeout(() => onCloseRef.current(), REST_DONE_MESSAGE_MS);
    return () => clearTimeout(id);
  }, [finished]);

  const accentColor = colors.accent[accent][1];

  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <GlossyBubble accent={accent} size={52}>
        <Ionicons name={finished ? 'flash' : 'timer'} size={28} color={colors.textOnColor} />
      </GlossyBubble>

      <View style={styles.middle}>
        <WiiText variant="label">{finished ? 'Descanso acabou' : 'Descanso'}</WiiText>
        <WiiText style={[styles.time, { color: accentColor }]}>
          {finished ? 'Próxima série!' : formatDuration(remainingMs + 999)}
        </WiiText>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
        </View>
      </View>

      {!finished && (
        <View style={styles.buttons}>
          <SmallButton label={`−${REST_STEP_SECONDS}`} onPress={() => onAdjust(-REST_STEP_SECONDS)} />
          <SmallButton label={`+${REST_STEP_SECONDS}`} onPress={() => onAdjust(REST_STEP_SECONDS)} />
        </View>
      )}
      <BouncyPressable onPress={onClose} hitSlop={8} style={styles.close}>
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </BouncyPressable>
    </View>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <BouncyPressable onPress={onPress} style={styles.small}>
      <WiiText style={styles.smallText}>{label}</WiiText>
    </BouncyPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 3,
    backgroundColor: colors.tileTop,
    boxShadow: '0px 6px 18px rgba(60, 90, 120, 0.30)',
  },
  middle: { flex: 1, gap: 2 },
  time: { fontFamily: fonts.black, fontSize: 30, lineHeight: 36 },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.tileBottom,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  buttons: { gap: spacing.xs },
  small: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    backgroundColor: colors.tileBottom,
    boxShadow: shadows.tile,
  },
  smallText: { fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' },
  close: { alignSelf: 'flex-start', padding: 2 },
});
