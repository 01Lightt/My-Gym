import { createPersistentStore } from '@/data/store';

/** Último tempo usado no cronômetro de descanso (segundos) — a tela abre com ele preenchido. */
const store = createPersistentStore<number>('my-academy/rest-timer/v1', 90);

export function useLastRestSeconds() {
  const { state, ready } = store.useStore();
  return { seconds: state, ready };
}

/** Último tempo do Timer salvo agora (usado pelo backup). */
export const getLastRestSeconds = () => store.getState();

export function setLastRestSeconds(seconds: number) {
  store.update(() => seconds);
}
