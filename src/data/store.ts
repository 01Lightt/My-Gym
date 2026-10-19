import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

type Snapshot<T> = { state: T; ready: boolean };

/**
 * Cria um "armazém" de dados que fica salvo no próprio celular (AsyncStorage).
 * Qualquer tela que use `useStore()` é atualizada automaticamente quando os dados mudam.
 */
export function createPersistentStore<T>(key: string, initial: T) {
  let snapshot: Snapshot<T> = { state: initial, ready: false };
  const listeners = new Set<() => void>();

  const emit = (next: Snapshot<T>) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  AsyncStorage.getItem(key)
    .then((raw) => emit({ state: raw ? (JSON.parse(raw) as T) : snapshot.state, ready: true }))
    .catch((error) => {
      console.warn(`Falha ao carregar "${key}"`, error);
      emit({ ...snapshot, ready: true });
    });

  function update(updater: (prev: T) => T) {
    const state = updater(snapshot.state);
    emit({ ...snapshot, state });
    AsyncStorage.setItem(key, JSON.stringify(state)).catch((error) =>
      console.warn(`Falha ao salvar "${key}"`, error),
    );
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useStore() {
    return useSyncExternalStore(subscribe, () => snapshot);
  }

  return { update, useStore, getState: () => snapshot.state };
}
