import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BouncyPressable } from '@/components/BouncyPressable';
import { GlossyBubble, RING_WIDTH } from '@/components/GlossyBubble';
import { WiiText } from '@/components/WiiText';
import { colors, fonts, spacing, type AccentName } from '@/theme';

const ACCENTS = Object.keys(colors.accent) as AccentName[];

/** Tamanho máximo de cada bolha; em telas estreitas elas diminuem para caber numa linha só. */
const MAX_BUBBLE = 38;
const MIN_GAP = 4;

type Props = { label: string; value: AccentName; onChange: (accent: AccentName) => void };

/** Escolha de cor com bolhas — as opções vêm automaticamente de `colors.accent` no tema. */
export function ColorPicker({ label, value, onChange }: Props) {
  const [width, setWidth] = useState(0);

  // Divide a largura disponível entre as cores (descontando o anel e um respiro entre elas)
  const slot = width / ACCENTS.length;
  const bubble = width > 0 ? Math.min(MAX_BUBBLE, Math.floor(slot - RING_WIDTH * 2 - MIN_GAP)) : MAX_BUBBLE;

  return (
    <View style={styles.field}>
      <WiiText style={styles.label}>{label}</WiiText>
      <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {ACCENTS.map((accent) => {
          const selected = accent === value;
          return (
            <BouncyPressable key={accent} onPress={() => onChange(accent)} hitSlop={4}>
              <GlossyBubble
                accent={accent}
                size={bubble}
                ringColor={selected ? colors.accent[accent][1] : 'transparent'}>
                {selected && <Ionicons name="checkmark" size={Math.round(bubble * 0.6)} color={colors.textOnColor} />}
              </GlossyBubble>
            </BouncyPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.bold, fontSize: 15, marginLeft: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
