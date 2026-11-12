import { exerciseMode, type ExerciseMode } from '@/data/routines';
import type { Workout, WorkoutExercise } from '@/data/workouts';

/**
 * Exercícios são comparados pelo nome (sem diferenciar maiúsculas nem espaços sobrando), então
 * "Supino reto" no Treino A e "supino  reto " no Treino C contam como o mesmo exercício.
 */
export const exerciseKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

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

/** Maior valor de um campo entre as séries feitas (ou null se nenhuma tiver o dado). */
function bestOf(exercise: WorkoutExercise, field: 'weightKg' | 'durationSec') {
  let best: number | null = null;
  for (const set of exercise.sets) {
    const value = set[field];
    if (set.done && value != null && (best == null || value > best)) best = value;
  }
  return best;
}

/** Maior carga usada em uma série feita do exercício (ou null se nenhuma). */
export const bestWeight = (exercise: WorkoutExercise) => bestOf(exercise, 'weightKg');

/** Maior tempo (segundos) em uma série feita do exercício (ou null se nenhuma). */
export const bestTime = (exercise: WorkoutExercise) => bestOf(exercise, 'durationSec');

/** Melhor marca do exercício no treino: carga máxima ou, nos exercícios por tempo, o maior tempo. */
const bestMark = (exercise: WorkoutExercise) =>
  exerciseMode(exercise) === 'time' ? bestTime(exercise) : bestWeight(exercise);

/** 1RM estimado pela fórmula de Epley: carga × (1 + reps / 30). */
export function estimateOneRepMax(weightKg: number, reps: number) {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

/**
 * Métricas do gráfico de evolução, sempre por treino e só com séries feitas:
 * - maxWeight: maior carga numa série;      - volume: soma de carga × reps;
 * - oneRepMax: maior 1RM estimado (Epley);  - reps: total de repetições (útil sem carga, ex.: barra fixa);
 * - maxTime: maior tempo numa série;        - totalTime: soma dos tempos (exercícios por tempo).
 */
export type Metric = 'maxWeight' | 'volume' | 'oneRepMax' | 'reps' | 'maxTime' | 'totalTime';

/** Métricas que fazem sentido em cada tipo de exercício, na ordem em que aparecem. */
export const METRICS_BY_MODE: Record<ExerciseMode, Metric[]> = {
  weight: ['maxWeight', 'volume', 'oneRepMax', 'reps'],
  time: ['maxTime', 'totalTime'],
};

/** Métricas somadas quando o mesmo exercício aparece duas vezes no treino (as outras pegam o maior). */
const SUMMED: Metric[] = ['volume', 'reps', 'totalTime'];

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Valor de uma métrica para um exercício em um treino (só séries feitas); null se não houver dado. */
function metricValue(exercise: WorkoutExercise, metric: Metric): number | null {
  const done = exercise.sets.filter((set) => set.done);
  switch (metric) {
    case 'maxWeight':
      return bestWeight(exercise);
    case 'maxTime':
      return bestTime(exercise);
    case 'totalTime': {
      const times = done.map((set) => set.durationSec ?? 0).filter((s) => s > 0);
      return times.length > 0 ? sum(times) : null;
    }
    case 'reps': {
      const reps = done.map((set) => set.reps ?? 0).filter((r) => r > 0);
      return reps.length > 0 ? sum(reps) : null;
    }
    case 'volume':
    case 'oneRepMax': {
      const loaded = done.filter((set) => set.weightKg != null && (set.reps ?? 0) > 0);
      if (loaded.length === 0) return null;
      if (metric === 'volume') return sum(loaded.map((set) => set.weightKg! * set.reps!));
      return Math.max(...loaded.map((set) => estimateOneRepMax(set.weightKg!, set.reps!)));
    }
  }
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
    const value = SUMMED.includes(metric) ? sum(values) : Math.max(...values);
    points.push({ date: workout.startedAt, value, workoutId: workout.id });
  }
  return points;
}

export type ExerciseOption = { key: string; name: string; mode: ExerciseMode; lastDate: number };

/** Exercícios com pelo menos uma série feita, do treinado mais recentemente para o mais antigo. */
export function exerciseOptions(workouts: Workout[]): ExerciseOption[] {
  const byKey = new Map<string, ExerciseOption>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (!exercise.sets.some((set) => set.done)) continue;
      const key = exerciseKey(exercise.name);
      const current = byKey.get(key);
      if (!current || workout.startedAt > current.lastDate) {
        byKey.set(key, { key, name: exercise.name.trim(), mode: exerciseMode(exercise), lastDate: workout.startedAt });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => b.lastDate - a.lastDate);
}

/** Melhor marca de um exercício: carga em kg ou, nos exercícios por tempo, segundos. */
export type PersonalBest = { key: string; name: string; mode: ExerciseMode; value: number; date: number };

/** Maior carga (ou maior tempo) de todos os tempos em cada exercício, em ordem alfabética. */
export function personalBests(workouts: Workout[]): PersonalBest[] {
  const byKey = new Map<string, PersonalBest>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const value = bestMark(exercise);
      if (value == null) continue;
      const mode = exerciseMode(exercise);
      const key = exerciseKey(exercise.name);
      // Separa por tipo: se o exercício mudou de carga para tempo, um recorde não se mistura com o outro
      const id = `${mode}:${key}`;
      const current = byKey.get(id);
      if (!current || value > current.value) {
        byKey.set(id, { key: id, name: exercise.name.trim(), mode, value, date: workout.startedAt });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export type PersonalRecord = { name: string; mode: ExerciseMode; value: number; previous: number };

/** Exercícios em que a melhor marca do treino superou a melhor de todos os treinos anteriores. */
export function findRecords(workout: Workout, history: Workout[]): PersonalRecord[] {
  const previousWorkouts = history.filter((w) => w.id !== workout.id && w.startedAt < workout.startedAt);

  return workout.exercises.flatMap((exercise) => {
    const best = bestMark(exercise);
    if (best == null) return [];

    const mode = exerciseMode(exercise);
    const key = exerciseKey(exercise.name);
    let previous: number | null = null;
    for (const past of previousWorkouts) {
      for (const pastExercise of past.exercises) {
        if (exerciseKey(pastExercise.name) !== key || exerciseMode(pastExercise) !== mode) continue;
        const pastBest = bestMark(pastExercise);
        if (pastBest != null && (previous == null || pastBest > previous)) previous = pastBest;
      }
    }

    return previous != null && best > previous ? [{ name: exercise.name, mode, value: best, previous }] : [];
  });
}
