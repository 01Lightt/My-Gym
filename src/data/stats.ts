import type { Workout, WorkoutExercise } from '@/data/workouts';

/**
 * Exercícios são comparados pelo nome (sem diferenciar maiúsculas), então
 * "Supino reto" no Treino A e no Treino C contam como o mesmo exercício.
 */
export const exerciseKey = (name: string) => name.trim().toLowerCase();

export function countSets(workout: Workout) {
  let done = 0;
  let total = 0;
  for (const exercise of workout.exercises) {
    total += exercise.sets.length;
    done += exercise.sets.filter((set) => set.done).length;
  }
  return { done, total };
}

/** Resumo do treino considerando só as séries marcadas como feitas. */
export function summarizeWorkout(workout: Workout) {
  let setsDone = 0;
  let totalReps = 0;
  let volumeKg = 0;
  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (!set.done) continue;
      setsDone++;
      totalReps += set.reps ?? 0;
      volumeKg += (set.weightKg ?? 0) * (set.reps ?? 0);
    }
  }
  const durationMs = (workout.finishedAt ?? Date.now()) - workout.startedAt;
  return { durationMs, setsDone, totalReps, volumeKg };
}

/** Maior carga usada em uma série feita do exercício (ou null se nenhuma). */
export function bestWeight(exercise: WorkoutExercise) {
  let best: number | null = null;
  for (const set of exercise.sets) {
    if (set.done && set.weightKg != null && (best == null || set.weightKg > best)) best = set.weightKg;
  }
  return best;
}

export type PersonalRecord = { name: string; weightKg: number; previousKg: number };

/** Exercícios em que a maior carga do treino superou a maior carga de todos os treinos anteriores. */
export function findRecords(workout: Workout, history: Workout[]): PersonalRecord[] {
  const previous = history.filter((w) => w.id !== workout.id && w.startedAt < workout.startedAt);

  return workout.exercises.flatMap((exercise) => {
    const best = bestWeight(exercise);
    if (best == null) return [];

    const key = exerciseKey(exercise.name);
    let previousKg: number | null = null;
    for (const past of previous) {
      for (const pastExercise of past.exercises) {
        if (exerciseKey(pastExercise.name) !== key) continue;
        const pastBest = bestWeight(pastExercise);
        if (pastBest != null && (previousKg == null || pastBest > previousKg)) previousKg = pastBest;
      }
    }

    return previousKg != null && best > previousKg ? [{ name: exercise.name, weightKg: best, previousKg }] : [];
  });
}
