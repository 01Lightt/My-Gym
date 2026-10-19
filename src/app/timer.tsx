import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TextInput, useWindowDimensions, Vibration, View } from 'react-native';

import { CountdownRing } from '@/components/CountdownRing';
import { PopIn } from '@/components/PopIn';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import { setLastRestSeconds, useLastRestSeconds } from '@/data/restTimer';
import { useNow } from '@/hooks/useNow';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatDuration } from '@/utils/format';

const PLIM = require('@/assets/sounds/plim.wav');

/** Cor do anel enquanto conta (a mesma do bloco "Descanso" no menu) e quando termina. */
const RING_COLOR = colors.accent.red[1];
const RING_DONE_COLOR = colors.accent.green[1];

type Status = 'setup' | 'running' | 'paused';

const nowMs = () => Date.now();
const pad = (n: number) => String(n).padStart(2, '0');
const toInt = (text: string) => parseInt(text.replace(/\D/g, ''), 10) || 0;

/** Cronômetro de descanso avulso: digite o tempo, acompanhe o anel e ouça o "plim" no fim. */
export default function TimerScreen() {
  const { seconds, ready } = useLastRestSeconds();
  // Espera carregar o último tempo usado para os campos já começarem preenchidos
  if (!ready) return <ScreenLayout title="Descanso">{null}</ScreenLayout>;
  return <RestTimer initialSeconds={seconds} />;
}

function RestTimer({ initialSeconds }: { initialSeconds: number }) {
  const [minutesText, setMinutesText] = useState(String(Math.floor(initialSeconds / 60)));
  const [secondsText, setSecondsText] = useState(pad(initialSeconds % 60));
  const [status, setStatus] = useState<Status>('setup');
  const [totalMs, setTotalMs] = useState(initialSeconds * 1000);
  const [endsAt, setEndsAt] = useState(0);
  const [pausedRemaining, setPausedRemaining] = useState(0);

  const now = useNow(200);
  const player = useAudioPlayer(PLIM);
  const { width } = useWindowDimensions();
  const ringSize = Math.min(width - spacing.xl * 2, 300);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const typedSeconds = Math.min(99, toInt(minutesText)) * 60 + Math.min(59, toInt(secondsText));
  const remaining =
    status === 'running' ? Math.max(0, endsAt - now) : status === 'paused' ? pausedRemaining : totalMs;
  const finished = status === 'running' && remaining === 0;

  // Fim do descanso: vibra e toca o "plim" uma vez
  useEffect(() => {
    if (!finished) return;
    Vibration.vibrate([0, 500, 200, 500]);
    player.seekTo(0);
    player.play();
  }, [finished, player]);

  const start = () => {
    const ms = typedSeconds * 1000;
    Keyboard.dismiss();
    setTotalMs(ms);
    setEndsAt(nowMs() + ms);
    setStatus('running');
    setLastRestSeconds(typedSeconds);
  };
  const pause = () => {
    setPausedRemaining(Math.max(0, endsAt - nowMs()));
    setStatus('paused');
  };
  const resume = () => {
    setEndsAt(nowMs() + pausedRemaining);
    setStatus('running');
  };
  const restart = () => {
    setEndsAt(nowMs() + totalMs);
    setStatus('running');
  };
  const backToSetup = () => setStatus('setup');

  // Correndo: o anel se anima sozinho até endsAt. Parado: mostra uma fração fixa.
  const counting = status === 'running' && !finished;
  const progress = status === 'paused' ? pausedRemaining / totalMs : 1;
  const label =
    status === 'setup' ? 'Quanto tempo?' : finished ? 'Próxima série!' : status === 'paused' ? 'Pausado' : 'Descansando';

  return (
    <ScreenLayout title="Descanso">
      {counting && <StayAwake />}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PopIn key={finished ? 'done' : 'counting'}>
          <CountdownRing
            progress={progress}
            countdown={counting ? { endsAt, totalMs } : null}
            size={ringSize}
            color={finished ? RING_DONE_COLOR : RING_COLOR}>
            <WiiText variant="label" style={styles.label}>
              {label}
            </WiiText>

            {status === 'setup' ? (
              <View style={styles.inputs}>
                <TimeInput value={minutesText} onChange={setMinutesText} unit="min" />
                <WiiText style={styles.colon}>:</WiiText>
                <TimeInput
                  value={secondsText}
                  onChange={setSecondsText}
                  onBlur={() => setSecondsText(pad(Math.min(59, toInt(secondsText))))}
                  unit="seg"
                />
              </View>
            ) : (
              <WiiText style={[styles.time, finished && { color: RING_DONE_COLOR }]}>
                {formatDuration(remaining + 999)}
              </WiiText>
            )}
          </CountdownRing>
        </PopIn>

        <View style={styles.buttons}>
          {status === 'setup' && (
            <WiiButton label="Começar" icon="play" accent="green" onPress={start} disabled={typedSeconds <= 0} />
          )}
          {counting && (
            <>
              <WiiButton label="Pausar" icon="pause" accent="orange" onPress={pause} />
              <WiiButton label="Cancelar" icon="stop" accent="red" variant="outline" onPress={backToSetup} />
            </>
          )}
          {status === 'paused' && (
            <>
              <WiiButton label="Continuar" icon="play" accent="green" onPress={resume} />
              <WiiButton label="Cancelar" icon="stop" accent="red" variant="outline" onPress={backToSetup} />
            </>
          )}
          {finished && (
            <>
              <WiiButton label="De novo" icon="refresh" accent="green" onPress={restart} />
              <WiiButton label="Mudar tempo" icon="create" variant="outline" onPress={backToSetup} />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const KEEP_AWAKE_TAG = 'rest-timer';

/**
 * Mantém a tela ligada enquanto estiver montado (só é renderizado com o cronômetro correndo).
 * Desliga só depois que o bloqueio terminou de ligar, e ignora falhas (ex.: navegador sem suporte),
 * para que um descanso curto nunca derrube o app.
 */
function StayAwake() {
  useEffect(() => {
    const activated = activateKeepAwakeAsync(KEEP_AWAKE_TAG).then(
      () => true,
      () => false,
    );
    return () => {
      activated.then((ok) => (ok ? deactivateKeepAwake(KEEP_AWAKE_TAG) : undefined)).catch(() => {});
    };
  }, []);
  return null;
}

type TimeInputProps = { value: string; onChange: (text: string) => void; onBlur?: () => void; unit: string };

function TimeInput({ value, onChange, onBlur, unit }: TimeInputProps) {
  return (
    <View style={styles.inputBox}>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
        onBlur={onBlur}
        keyboardType="number-pad"
        maxLength={2}
        selectTextOnFocus
        style={styles.input}
      />
      <WiiText variant="label">{unit}</WiiText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.lg, alignItems: 'center' },
  label: { fontFamily: fonts.bold, fontSize: 16 },
  inputs: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },
  inputBox: { alignItems: 'center', gap: 2 },
  input: {
    width: 78,
    fontFamily: fonts.black,
    fontSize: 44,
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.tileBottom,
    borderWidth: 2,
    borderColor: colors.tileBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    outlineWidth: 0,
  },
  colon: { fontFamily: fonts.black, fontSize: 44, lineHeight: 64, color: colors.textMuted },
  time: { fontFamily: fonts.black, fontSize: 64, lineHeight: 76, color: colors.text },
  buttons: { alignSelf: 'stretch', gap: spacing.md },
});
