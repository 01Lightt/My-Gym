import { useEffect } from 'react';
import { Platform } from 'react-native';

import { colors } from '@/theme';

type NotificationsModule = typeof import('expo-notifications');

/** Canal do Android usado pelos avisos de fim de tempo (descanso entre séries e Timer). */
const CHANNEL_ID = 'timer';

let notifications: NotificationsModule | null | undefined;

/**
 * Carrega o expo-notifications só quando for usar, protegido contra falha.
 * No Expo Go o pacote não carrega (falta uma parte nativa), então o app segue sem avisos;
 * no APK ele funciona normalmente. Na web não há suporte.
 */
function load(): NotificationsModule | null {
  if (notifications !== undefined) return notifications;
  if (Platform.OS === 'web') return (notifications = null);
  try {
    // require() de propósito: um import normal quebraria a tela inteira se o pacote não carregar
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('expo-notifications') as NotificationsModule;
    // Com o app aberto na tela o aviso não aparece: já tem a vibração e o "plim".
    // Com o app em segundo plano ou fechado, quem mostra é o próprio sistema.
    module.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    notifications = module;
  } catch (error) {
    console.warn('Notificações indisponíveis neste ambiente (ex.: Expo Go)', error);
    notifications = null;
  }
  return notifications;
}

let setup: Promise<boolean> | null = null;

/** Cria o canal (necessário antes de pedir permissão no Android 13+) e pede permissão uma vez. */
function ensureReady(Notifications: NotificationsModule) {
  setup ??= (async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Timer',
        description: 'Avisa quando o descanso ou o timer acaba',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: colors.primary,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  })().catch((error) => {
    console.warn('Notificações indisponíveis', error);
    setup = null;
    return false;
  });
  return setup;
}

type Content = { title: string; body: string };

/** Agenda um aviso para o momento `endsAt` (ms). Retorna o id para cancelar, ou null. */
async function scheduleAt(endsAt: number, content: Content) {
  const Notifications = load();
  if (!Notifications || !(await ensureReady(Notifications))) return null;
  const seconds = Math.round((endsAt - Date.now()) / 1000);
  if (seconds < 1) return null;
  return Notifications.scheduleNotificationAsync({
    content: { ...content, sound: true, color: colors.primary },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: CHANNEL_ID,
    },
  });
}

function cancel(id: string) {
  load()
    ?.cancelScheduledNotificationAsync(id)
    .catch(() => {});
}

/**
 * Mantém um aviso agendado para quando um tempo acabar.
 * Passe `endsAt = null` (ou desmonte o componente) para cancelar; mudar `endsAt` reagenda.
 */
export function useTimerNotification(endsAt: number | null, title: string, body: string) {
  useEffect(() => {
    if (endsAt == null) return;
    let id: string | null = null;
    let cancelled = false;

    scheduleAt(endsAt, { title, body })
      .then((scheduledId) => {
        if (cancelled && scheduledId) cancel(scheduledId);
        else id = scheduledId;
      })
      .catch((error) => console.warn('Falha ao agendar aviso', error));

    return () => {
      cancelled = true;
      if (id) cancel(id);
    };
  }, [endsAt, title, body]);
}
