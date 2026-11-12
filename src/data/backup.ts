import { getLastRestSeconds, setLastRestSeconds } from '@/data/restTimer';
import { getRoutines, replaceRoutines, type Routine } from '@/data/routines';
import { createPersistentStore } from '@/data/store';
import { getActiveWorkout, getWorkoutHistory, replaceWorkouts, type Workout } from '@/data/workouts';
import { colors } from '@/theme';
import { dayKey } from '@/utils/date';

/**
 * BACKUP: todos os dados do app (fichas, histórico, treino em andamento e o último tempo do
 * Timer) num arquivo .json que fica fora do app.
 *
 * Para que serve: trocar de celular, reinstalar o app, ou passar do APK para a versão da Play
 * Store. Essa última é assinada com outra chave, então não atualiza o app instalado por APK:
 * é preciso desinstalar, e desinstalar apaga os dados. Com o backup, exporta antes e importa depois.
 *
 * Aqui fica só a lógica (montar, validar e restaurar). Salvar e escolher o arquivo no
 * celular fica em utils/files.ts.
 */

/**
 * Marca que identifica o arquivo como backup deste app.
 * NÃO mude ao renomear o app: backups antigos deixariam de ser reconhecidos.
 * Para mudar o nome do arquivo, mude FILE_PREFIX.
 */
const FORMAT = 'mii-gym-backup';

/** Começo do nome do arquivo de backup (pode mudar à vontade se o app for renomeado). */
const FILE_PREFIX = 'mii-gym-backup';

/**
 * Versão do formato do arquivo. Aumente quando a estrutura mudar de um jeito que uma versão
 * antiga do app não entenderia; o app recusa backups de versões mais novas que a dele.
 */
const VERSION = 1;

/** Tempo padrão do Timer, se o backup não trouxer um válido. */
const DEFAULT_REST_SECONDS = 90;

export type Backup = {
  format: typeof FORMAT;
  version: number;
  /** Quando o backup foi feito (ms). */
  exportedAt: number;
  data: {
    routines: Routine[];
    workouts: Workout[];
    activeWorkout: Workout | null;
    restSeconds: number;
  };
};

/** Erro com uma mensagem pronta para mostrar na tela. */
export class BackupError extends Error {}

/** Quando foi feito o último backup neste celular (ms), para a tela lembrar. */
const lastBackupStore = createPersistentStore<number | null>('my-academy/last-backup/v1', null);

export function useLastBackupAt() {
  const { state, ready } = lastBackupStore.useStore();
  return { lastBackupAt: state, ready };
}

/** Monta o backup com os dados salvos agora. */
export function createBackup(): Backup {
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: Date.now(),
    data: {
      routines: getRoutines(),
      workouts: getWorkoutHistory(),
      activeWorkout: getActiveWorkout(),
      restSeconds: getLastRestSeconds(),
    },
  };
}

/** Registra que o backup foi exportado (a data aparece na tela de Backup). */
export function markBackupExported(at: number) {
  lastBackupStore.update(() => at);
}

/** Nome do arquivo, com a data para ficar fácil achar o mais recente: "mii-gym-backup-2026-11-12.json". */
export function backupFileName(at: number) {
  return `${FILE_PREFIX}-${dayKey(at)}.json`;
}

// Validação: o arquivo pode ter vindo de qualquer lugar (outro app, um arquivo cortado no
// meio do download...). Checa o formato antes de trocar os dados, para um arquivo errado
// nunca deixar o app quebrado.

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
/** Número, null ou ausente (campos opcionais como carga, reps e tempo). */
const isOptNum = (v: unknown) => v == null || isNum(v);
/**
 * Uma cor que existe no tema: uma cor desconhecida quebraria as telas que pintam pela ficha.
 * hasOwnProperty (e não `in`): `in` também aceitaria nomes herdados, como "toString".
 */
const isAccent = (v: unknown) => isStr(v) && Object.prototype.hasOwnProperty.call(colors.accent, v);
const isMode = (v: unknown) => v == null || v === 'weight' || v === 'time';

function isRoutineExercise(v: unknown) {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.name) &&
    isNum(v.sets) &&
    isStr(v.reps) &&
    isOptNum(v.weightKg) &&
    isStr(v.notes) &&
    isMode(v.mode) &&
    isOptNum(v.durationSec)
  );
}

function isRoutine(v: unknown): v is Routine {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.label) &&
    isStr(v.name) &&
    isAccent(v.accent) &&
    Array.isArray(v.exercises) &&
    v.exercises.every(isRoutineExercise)
  );
}

function isWorkoutSet(v: unknown) {
  return isObj(v) && typeof v.done === 'boolean' && isOptNum(v.weightKg) && isOptNum(v.reps) && isOptNum(v.durationSec);
}

function isWorkoutExercise(v: unknown) {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.name) &&
    isMode(v.mode) &&
    Array.isArray(v.sets) &&
    v.sets.every(isWorkoutSet)
  );
}

function isWorkout(v: unknown): v is Workout {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.label) &&
    isStr(v.name) &&
    isAccent(v.accent) &&
    isNum(v.startedAt) &&
    isOptNum(v.finishedAt) &&
    Array.isArray(v.exercises) &&
    v.exercises.every(isWorkoutExercise)
  );
}

/** Lê o texto de um arquivo de backup. Lança BackupError com a explicação se o arquivo não servir. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    // Ignora a marca invisível de UTF-8 (BOM) que alguns editores, como o Bloco de Notas, põem no início
    raw = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    throw new BackupError('Este arquivo não é um backup do app.');
  }
  if (!isObj(raw) || raw.format !== FORMAT) {
    throw new BackupError('Este arquivo não é um backup do app.');
  }
  if (!isNum(raw.version) || raw.version > VERSION) {
    throw new BackupError('Este backup foi feito numa versão mais nova do app. Atualize o app e tente de novo.');
  }

  const data = raw.data;
  const valid =
    isObj(data) &&
    Array.isArray(data.routines) &&
    data.routines.every(isRoutine) &&
    Array.isArray(data.workouts) &&
    data.workouts.every(isWorkout) &&
    (data.activeWorkout == null || isWorkout(data.activeWorkout));
  if (!valid) {
    throw new BackupError('O arquivo de backup está incompleto ou danificado.');
  }

  return {
    format: FORMAT,
    version: raw.version,
    exportedAt: isNum(raw.exportedAt) ? raw.exportedAt : 0,
    data: {
      routines: data.routines as Routine[],
      workouts: data.workouts as Workout[],
      activeWorkout: (data.activeWorkout ?? null) as Workout | null,
      restSeconds: isNum(data.restSeconds) && data.restSeconds > 0 ? data.restSeconds : DEFAULT_REST_SECONDS,
    },
  };
}

/** Troca todos os dados do app pelos do backup. */
export function restoreBackup(backup: Backup) {
  replaceRoutines(backup.data.routines);
  replaceWorkouts(backup.data.workouts, backup.data.activeWorkout);
  setLastRestSeconds(backup.data.restSeconds);
}
