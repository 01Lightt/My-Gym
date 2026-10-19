import { createPersistentStore } from '@/data/store';
import type { AccentName } from '@/theme';
import { createId } from '@/utils/id';

/** Um exercício dentro de uma ficha. */
export type RoutineExercise = {
  id: string;
  name: string;
  sets: number;
  /** Texto livre para aceitar faixas, ex.: "10" ou "10-12". */
  reps: string;
  weightKg: number | null;
  notes: string;
};

/** Uma ficha de treino (Treino A, B, C...). */
export type Routine = {
  id: string;
  /** Letra ou apelido curto exibido em destaque, ex.: "A". */
  label: string;
  name: string;
  accent: AccentName;
  exercises: RoutineExercise[];
};

export type RoutineInput = Pick<Routine, 'label' | 'name' | 'accent'>;
export type ExerciseInput = Omit<RoutineExercise, 'id'>;

const store = createPersistentStore<Routine[]>('my-academy/routines/v1', []);

export function useRoutines() {
  const { state, ready } = store.useStore();
  return { routines: state, ready };
}

export function useRoutine(id: string | undefined) {
  const { routines, ready } = useRoutines();
  return { routine: routines.find((r) => r.id === id), ready };
}

/** Sugere a próxima letra livre (A, B, C...) para uma nova ficha. */
export function suggestNextLabel(routines: Routine[]) {
  const used = new Set(routines.map((r) => r.label.toUpperCase()));
  for (let code = 65; code <= 90; code++) {
    const letter = String.fromCharCode(code);
    if (!used.has(letter)) return letter;
  }
  return '';
}

/** Cria uma ficha nova (sem id) ou atualiza uma existente. Retorna o id. */
export function saveRoutine(input: RoutineInput, id?: string) {
  const routineId = id ?? createId();
  store.update((routines) =>
    id
      ? routines.map((r) => (r.id === id ? { ...r, ...input } : r))
      : [...routines, { ...input, id: routineId, exercises: [] }],
  );
  return routineId;
}

export function deleteRoutine(id: string) {
  store.update((routines) => routines.filter((r) => r.id !== id));
}

function updateExercises(
  routineId: string,
  updater: (exercises: RoutineExercise[]) => RoutineExercise[],
) {
  store.update((routines) =>
    routines.map((r) => (r.id === routineId ? { ...r, exercises: updater(r.exercises) } : r)),
  );
}

/** Adiciona um exercício (sem exerciseId) ou atualiza um existente. */
export function saveExercise(routineId: string, input: ExerciseInput, exerciseId?: string) {
  updateExercises(routineId, (exercises) =>
    exerciseId
      ? exercises.map((e) => (e.id === exerciseId ? { ...e, ...input } : e))
      : [...exercises, { ...input, id: createId() }],
  );
}

export function deleteExercise(routineId: string, exerciseId: string) {
  updateExercises(routineId, (exercises) => exercises.filter((e) => e.id !== exerciseId));
}

/** Move um exercício uma posição para cima (-1) ou para baixo (+1). */
export function moveExercise(routineId: string, exerciseId: string, direction: -1 | 1) {
  updateExercises(routineId, (exercises) => {
    const from = exercises.findIndex((e) => e.id === exerciseId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= exercises.length) return exercises;
    const next = [...exercises];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  });
}
