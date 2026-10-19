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

/** 1RM estimado pela fórmula de Epley: carga × (1 + reps / 30). */
export function estimateOneRepMax(weightKg: number, reps: number) {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

export type Metric = 'maxWeight' | 'volume' | 'oneRepMax';

/** Valor de uma métrica para um exercício em um treino (só séries feitas); null se não houver dado. */
function metricValue(exercise: WorkoutExercise, metric: Metric): number | null {
  const done = exercise.sets.filter((set) => set.done && set.weightKg != null);
  if (metric === 'maxWeight') return bestWeight(exercise);

  const withReps = done.filter((set) => (set.reps ?? 0) > 0);
  if (withReps.length === 0) return null;
  if (metric === 'volume') return withReps.reduce((sum, set) => sum + set.weightKg! * set.reps!, 0);
  return Math.max(...withReps.map((set) => estimateOneRepMax(set.weightKg!, set.reps!)));
}

export type SeriesPoint = { date: number; value: number; workoutId: string };

/** Um ponto por treino em que o exercício (pelo nome) teve dado para a métrica, em ordem de data. */
export function exerciseSeries(workouts: Workout[], key: string, metric: Metric): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (const workout of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const values = workout.exercises
      .filter((exercise) => exerciseKey(exercise.name) === key)
      .map((exercise) => metricValue(exercise, metric))
      .filter((value): value is number => value != null);
    if (values.length === 0) continue;
    // Mesmo exercício duas vezes no treino: soma o volume, pega o maior nas outras métricas
    const value = metric === 'volume' ? values.reduce((a, b) => a + b, 0) : Math.max(...values);
    points.push({ date: workout.startedAt, value, workoutId: workout.id });
  }
  return points;
}

export type ExerciseOption = { key: string; name: string; lastDate: number };

/** Exercícios com pelo menos uma série feita, do treinado mais recentemente para o mais antigo. */
export function exerciseOptions(workouts: Workout[]): ExerciseOption[] {
  const byKey = new Map<string, ExerciseOption>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (!exercise.sets.some((set) => set.done)) continue;
      const key = exerciseKey(exercise.name);
      const current = byKey.get(key);
      if (!current || workout.startedAt > current.lastDate) {
        byKey.set(key, { key, name: exercise.name.trim(), lastDate: workout.startedAt });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => b.lastDate - a.lastDate);
}

export type BestLift = { key: string; name: string; weightKg: number; date: number };

/** Maior carga de todos os tempos em cada exercício, em ordem alfabética. */
export function bestLifts(workouts: Workout[]): BestLift[] {
  const byKey = new Map<string, BestLift>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const best = bestWeight(exercise);
      if (best == null) continue;
      const key = exerciseKey(exercise.name);
      const current = byKey.get(key);
      if (!current || best > current.weightKg) {
        byKey.set(key, { key, name: exercise.name.trim(), weightKg: best, date: workout.startedAt });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
