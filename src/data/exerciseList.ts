import { exerciseMode, type Routine } from '@/data/routines';
import { dayKey } from '@/utils/date';
import { buildXlsx, type XlsxCell, type XlsxColumn } from '@/utils/xlsx';

/**
 * LISTA DE EXERCÍCIOS EM PLANILHA: todas as fichas e seus exercícios numa planilha .xlsx,
 * para abrir no Excel ou no Google Planilhas, imprimir ou mandar para alguém.
 * É só para ler: diferente do backup, essa planilha não volta para o app.
 */

const COLUMNS: XlsxColumn[] = [
  { header: 'Ficha', width: 7 },
  { header: 'Nome da ficha', width: 22 },
  { header: 'Ordem', width: 7 },
  { header: 'Exercício', width: 28 },
  { header: 'Medir por', width: 12 },
  { header: 'Séries', width: 8 },
  { header: 'Repetições', width: 12 },
  { header: 'Carga sugerida (kg)', width: 19 },
  { header: 'Tempo por série (s)', width: 19 },
  { header: 'Observações', width: 40 },
];

/** Uma linha por exercício, na ordem das fichas e dos exercícios dentro de cada uma. */
function exerciseRows(routines: Routine[]): XlsxCell[][] {
  return routines.flatMap((routine) =>
    routine.exercises.map((exercise, index) => {
      const timed = exerciseMode(exercise) === 'time';
      return [
        routine.label,
        routine.name,
        index + 1,
        exercise.name,
        timed ? 'Tempo' : 'Peso e reps',
        exercise.sets,
        // Repetições ficam como texto: aceitam faixas como "8-10"
        timed ? null : exercise.reps || null,
        timed ? null : exercise.weightKg,
        timed ? (exercise.durationSec ?? null) : null,
        exercise.notes || null,
      ];
    }),
  );
}

/** Quantos exercícios entram na planilha (fichas sem exercício não geram linhas). */
export const countExercises = (routines: Routine[]) => routines.reduce((n, r) => n + r.exercises.length, 0);

/** Bytes do arquivo .xlsx com todas as fichas. */
export function buildExerciseListXlsx(routines: Routine[]) {
  return buildXlsx('Exercícios', COLUMNS, exerciseRows(routines));
}

/** "fichas-2026-11-12.xlsx" */
export const exerciseListFileName = (at: number) => `fichas-${dayKey(at)}.xlsx`;
