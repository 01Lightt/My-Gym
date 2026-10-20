import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChannelTile, EmptyChannelTile } from '@/components/ChannelTile';
import { ClockBar } from '@/components/ClockBar';
import { WiiBackground } from '@/components/WiiBackground';
import { channels, GRID_SLOTS } from '@/config/channels';
import { spacing } from '@/theme';

const COLUMNS = 2;
const GAP = 10;

/**
 * Menu principal, como o Menu do Wii: grade de canais (sem título) completada
 * com blocos vazios até GRID_SLOTS. Os blocos crescem para ocupar todo o espaço
 * até a barra com o relógio.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState({ width: 0, height: 0 });

  const rows = Math.ceil(Math.max(GRID_SLOTS, channels.length) / COLUMNS);
  const slots = Array.from({ length: rows * COLUMNS }, (_, i) => channels[i] ?? null);
  const size = {
    width: (area.width - spacing.md * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
    // Altura disponível (sem a área do topo e as margens) dividida entre as fileiras
    height: (area.height - insets.top - spacing.md * 2 - GAP * (rows - 1)) / rows,
  };

  return (
    <WiiBackground>
      <View
        style={[styles.grid, { paddingTop: insets.top + spacing.md }]}
        onLayout={(e) => setArea({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
        {size.width > 0 &&
          size.height > 0 &&
          slots.map((channel, i) =>
            channel ? (
              <ChannelTile key={channel.id} channel={channel} size={size} />
            ) : (
              <EmptyChannelTile key={`empty-${i}`} size={size} />
            ),
          )}
      </View>

      <ClockBar />
    </WiiBackground>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: GAP,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
});
