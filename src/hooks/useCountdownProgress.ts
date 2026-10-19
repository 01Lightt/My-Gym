import { useEffect } from 'react';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';

type Countdown = { endsAt: number; totalMs: number };

/**
 * Fração restante de uma contagem regressiva (1 → 0) como valor animado do Reanimated.
 * Com `countdown`, desce em linha reta até `endsAt` na thread de interface (suave, a cada quadro).
 * Sem `countdown`, fica parada em `staticProgress` (ex.: pausado).
 * Só reinicia quando endsAt/totalMs mudam — ou seja, ao começar, pausar, continuar ou ajustar o tempo.
 */
export function useCountdownProgress(staticProgress: number, countdown?: Countdown | null) {
  const fraction = useSharedValue(staticProgress);
  const endsAt = countdown?.endsAt;
  const totalMs = countdown?.totalMs;

  useEffect(() => {
    cancelAnimation(fraction);
    if (endsAt != null && totalMs) {
      const remaining = Math.max(0, endsAt - Date.now());
      fraction.value = Math.min(1, remaining / totalMs);
      fraction.value = withTiming(0, { duration: remaining, easing: Easing.linear });
    } else {
      fraction.value = Math.min(1, Math.max(0, staticProgress));
    }
  }, [fraction, staticProgress, endsAt, totalMs]);

  return fraction;
}
