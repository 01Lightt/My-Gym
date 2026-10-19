import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChannelTile } from '@/components/ChannelTile';
import { ClockBar } from '@/components/ClockBar';
import { WiiBackground } from '@/components/WiiBackground';
import { WiiText } from '@/components/WiiText';
import { channels } from '@/config/channels';
import { colors, spacing } from '@/theme';

const COLUMNS = 2;

/** Menu principal: grade de blocos estilo canais do Wii + relógio embaixo. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const rows = [];
  for (let i = 0; i < channels.length; i += COLUMNS) {
    rows.push(channels.slice(i, i + COLUMNS));
  }

  return (
    <WiiBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        <WiiText variant="display" style={styles.logo}>
          My Academy
        </WiiText>

        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((channel) => (
              <ChannelTile key={channel.id} channel={channel} />
            ))}
            {/* Completa a linha para os blocos manterem o mesmo tamanho */}
            {row.length < COLUMNS && <View style={styles.spacer} />}
          </View>
        ))}
      </ScrollView>

      <ClockBar />
    </WiiBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  logo: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.sm,
    textShadowColor: colors.primaryLight,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spacer: { flex: 1 },
});
