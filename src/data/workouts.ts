import { exerciseMode, type ExerciseMode, type Routine } from '@/data/routines';
import { createPersistentStore } from '@/data/store';
import type { AccentName } from '@/theme';
import { parseReps } from '@/utils/format';
import { createId } from '@/utils/id';

/** Uma série feita (ou planejada) durante o treino. */
export type WorkoutSet = {
  weightKg: number | null;
  reps: number | null;
  /** Tempo da série (segundos), nos exercícios medidos por tempo. */
  durationSec?: number | null;
  done: boolean;
};

/** Um exercício do treino, copiado da ficha no momento em que o treino começou. */
export type WorkoutExercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  notes: string;
  sets: WorkoutSet[];
  /** Ausente nos treinos salvos antes desta opção existir: valem como "weight". */
  mode?: ExerciseMode;
  /** Tempo por série pedido na ficha (segundos), no modo "time". */
  targetDurationSec?: number | null;
};

/** Descanso entre séries em andamento. */
export type Rest = {
  /** Momento (ms) em que o descanso termina. */
  endsAt: number;
  /** Duração total (s), para a barra de progresso. */
  totalSeconds: number;
};

/** Um treino (em andamento ou finalizado). */
export type Workout = {
  id: string;
  routineId: string;
  label: string;
  name: string;
  accent: AccentName;
  startedAt: number;
  finishedAt: number | null;
  exercises: WorkoutExercise[];
  /**
   * Descanso em andamento. Fica salvo junto com o treino para não sumir ao sair da tela
   * (ir ao menu, abrir outra tela ou fechar o app no meio do descanso).
   */
  rest?: Rest | null;
};

/** Treino em andamento — fica salvo para não se perder se o app fechar no meio. */
const activeStore = createPersistentStore<Workout | null>('my-academy/active-workout/v1', null);
/** Treinos finalizados. */
const historyStore = createPersistentStore<Workout[]>('my-academy/workouts/v1', []);

export function useActiveWorkout() {
  const { state, ready } = activeStore.useStore();
  return { workout: state, ready };
}

export function useWorkoutHistory() {
  const { state, ready } = historyStore.useStore();
  return { workouts: state, ready };
}

/** Começa um treino a partir de uma ficha, com carga e repetições pré-preenchidas pela ficha. */
export function startWorkout(routine: Routine) {
  activeStore.update(() => ({
    id: createId(),
    routineId: routine.id,
    label: routine.label,
    name: routine.name,
    accent: routine.accent,
    startedAt: Date.now(),
    finishedAt: null,
    exercises: routine.exercises.map((exercise) => {
      const mode = exerciseMode(exercise);
      const timed = mode === 'time';
      return {
        id: exercise.id,
        name: exercise.name,
        targetSets: exercise.sets,
        targetReps: timed ? '' : exercise.reps,
        notes: exercise.notes,
        mode,
        targetDurationSec: timed ? (exercise.durationSec ?? null) : null,
        sets: Array.from({ length: exercise.sets }, () => ({
          weightKg: timed ? null : exercise.weightKg,
          reps: timed ? null : parseReps(exercise.reps),
          durationSec: timed ? (exercise.durationSec ?? null) : null,
          done: false,
        })),
      };
    }),
    rest: null,
  }));
}

/** Começa (ou recomeça) o descanso entre séries. */
export function startRest(seconds: number) {
  activeStore.update(
    (workout) => workout && { ...workout, rest: { endsAt: Date.now() + seconds * 1000, totalSeconds: seconds } },
  );
}

/**
 * Soma ou tira segundos do descanso em andamento (botões −15 / +15).
 * Tirar mais do que falta termina o descanso agora (nunca deixa o fim no passado).
 */
export function adjustRest(deltaSeconds: number) {
  activeStore.update(
    (workout) =>
      workout?.rest
        ? {
            ...workout,
            rest: {
              endsAt: Math.max(Date.now(), workout.rest.endsAt + deltaSeconds * 1000),
              totalSeconds: Math.max(1, workout.rest.totalSeconds + deltaSeconds),
            },
          }
        : workout,
  );
}

export function clearRest() {
  activeStore.update((workout) => (workout?.rest ? { ...workout, rest: null } : workout));
}

function updateSets(exerciseIndex: number, updater: (sets: WorkoutSet[]) => WorkoutSet[]) {
  activeStore.update(
    (workout) =>
      workout && {
        ...workout,
        exercises: workout.exercises.map((exercise, i) =>
          i === exerciseIndex ? { ...exercise, sets: updater(exercise.sets) } : exercise,
        ),
      },
  );
}

export function updateSet(exerciseIndex: number, setIndex: number, patch: Partial<WorkoutSet>) {
  updateSets(exerciseIndex, (sets) => sets.map((set, i) => (i === setIndex ? { ...set, ...patch } : set)));
}

/** Adiciona uma série no fim, repetindo a carga e as repetições da última. */
export function addSet(exerciseIndex: number) {
  updateSets(exerciseIndex, (sets) => {
    const last = sets[sets.length - 1];
    return [
      ...sets,
      {
        weightKg: last?.weightKg ?? null,
        reps: last?.reps ?? null,
        durationSec: last?.durationSec ?? null,
        done: false,
      },
    ];
  });
}

/** Remove a última série (sempre sobra pelo menos uma). */
export function removeSet(exerciseIndex: number) {
  updateSets(exerciseIndex, (sets) => (sets.length > 1 ? sets.slice(0, -1) : sets));
}

/** Finaliza o treino em andamento e o guarda no histórico. Retorna o id do treino. */
export function finishWorkout() {
  const workout = activeStore.getState();
  if (!workout) return null;
  historyStore.update((history) => [...history, { ...workout, finishedAt: Date.now(), rest: null }]);
  activeStore.update(() => null);
  return workout.id;
}

/** Remove um treino finalizado do histórico. */
export function deleteWorkout(id: string) {
  historyStore.update((history) => history.filter((w) => w.id !== id));
}

export function discardWorkout() {
  activeStore.update(() => null);
}
