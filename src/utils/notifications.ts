import { useEffect } from 'react';
import { Platform } from 'react-native';

import { colors } from '@/theme';

type NotificationsModule = typeof import('expo-notifications');

/*
 * Avisos de fim de tempo (descanso entre séries e Timer) no horário exato.
 *
 * No Android 12+ o sistema só dispara um alarme na hora certa se o app tiver permissão de
 * "alarme exato"; sem ela o expo-notifications usa um alarme inexato, que o sistema pode
 * atrasar alguns segundos (ou mais). O Android 14 deixou de conceder SCHEDULE_EXACT_ALARM na
 * instalação, por isso o app.json declara também USE_EXACT_ALARM, que é concedida sozinha.
 * (Se um dia o app for para a Play Store, ela só aceita USE_EXACT_ALARM em apps de alarme/timer.)
 */

/** Canal do Android usado pelos avisos de fim de tempo (descanso entre séries e Timer). */
const CHANNEL_ID = 'timer';

/** Avisos que o app agenda. Cada um tem um id fixo: agendar de novo substitui o anterior. */
export type TimerNotificationId = 'rest' | 'timer';

/** Telas abertas agora que já avisam sozinhas do fim do tempo (vibração e "plim"). */
const screensOpen = new Set<string>();

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
    // Com o app em segundo plano ou fechado, quem mostra o aviso é o próprio sistema.
    // Com o app aberto: se a tela do cronômetro está aberta, ela já vibra/toca e o aviso ficaria
    // repetido; em qualquer outra tela (ex.: foi ao menu no meio do descanso) o aviso aparece.
    module.setNotificationHandler({
      handleNotification: async (notification) => {
        const show = !screensOpen.has(notification.request.identifier);
        return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
      },
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

/**
 * Fila dos pedidos ao sistema: cada um só começa quando o anterior termina.
 * Ao ajustar o descanso (±15 s) o app cancela e reagenda o mesmo aviso; sem a fila, o
 * "cancelar" poderia chegar ao Android depois do "agendar" novo e apagar o aviso certo.
 */
let queue: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<unknown>) {
  queue = queue.then(task).then(
    () => undefined,
    (error) => console.warn('Falha no aviso de fim de tempo', error),
  );
}

/**
 * Agenda o aviso `id` para o momento exato `endsAt` (ms).
 * Usa um gatilho de data (hora marcada) em vez de "daqui a N segundos": não acumula o
 * arredondamento dos segundos nem o tempo que o pedido leva até chegar ao sistema.
 */
function scheduleAt(id: TimerNotificationId, endsAt: number, content: Content, isCancelled: () => boolean) {
  enqueue(async () => {
    const Notifications = load();
    if (!Notifications || !(await ensureReady(Notifications))) return;
    // Pode ter mudado enquanto esperava (ex.: o pedido de permissão ficou aberto na tela)
    if (isCancelled() || endsAt - Date.now() < 1000) return;
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { ...content, sound: true, color: colors.primary },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: endsAt,
        channelId: CHANNEL_ID,
      },
    });
  });
}

function cancel(id: TimerNotificationId) {
  enqueue(async () => {
    await load()?.cancelScheduledNotificationAsync(id);
  });
}

/**
 * Mantém o aviso `id` agendado para quando um tempo acabar.
 * Passe `endsAt = null` (ou desmonte o componente) para cancelar; mudar `endsAt` reagenda.
 */
export function useTimerNotification(id: TimerNotificationId, endsAt: number | null, title: string, body: string) {
  useEffect(() => {
    if (endsAt == null) return;
    let cancelled = false;
    scheduleAt(id, endsAt, { title, body }, () => cancelled);
    return () => {
      cancelled = true;
      cancel(id);
    };
  }, [id, endsAt, title, body]);
}

/**
 * Use na tela que já avisa sozinha do fim do tempo `id` (vibração/"plim"): enquanto ela está
 * aberta, o aviso do sistema não aparece por cima. Fora dela, o aviso aparece mesmo com o app aberto.
 */
export function useTimerScreenOpen(id: TimerNotificationId) {
  useEffect(() => {
    screensOpen.add(id);
    return () => {
      screensOpen.delete(id);
    };
  }, [id]);
}
