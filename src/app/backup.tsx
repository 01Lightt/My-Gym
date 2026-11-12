import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ScreenLayout, ScreenScrollView } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { WiiText } from '@/components/WiiText';
import {
  BackupError,
  backupFileName,
  createBackup,
  markBackupExported,
  parseBackup,
  restoreBackup,
  useLastBackupAt,
  type Backup,
} from '@/data/backup';
import { buildExerciseListXlsx, countExercises, exerciseListFileName } from '@/data/exerciseList';
import { useLastRestSeconds } from '@/data/restTimer';
import { useRoutines } from '@/data/routines';
import { useActiveWorkout, useWorkoutHistory } from '@/data/workouts';
import { colors, fonts, radius, spacing } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { formatWeekdayDate } from '@/utils/date';
import { FILE_TYPES, pickTextFile, shareFile } from '@/utils/files';
import { plural } from '@/utils/format';

type Status = { kind: 'ok' | 'error'; text: string };

/** "3 fichas e 12 treinos" (+ "mais um treino em andamento"), para os textos da tela. */
function describe(routines: number, workouts: number, active: boolean) {
  const base = `${plural(routines, 'ficha', 'fichas')} e ${plural(workouts, 'treino', 'treinos')}`;
  return active ? `${base} (mais um treino em andamento)` : base;
}

/**
 * Backup, com duas opções:
 * - Trocar de celular: exportar todos os dados num arquivo e importar no outro celular;
 * - Exportar lista: as fichas e exercícios numa planilha .xlsx (Excel / Google Planilhas).
 */
export default function BackupScreen() {
  const { routines, ready: routinesReady } = useRoutines();
  const { workouts, ready: historyReady } = useWorkoutHistory();
  const { workout, ready: activeReady } = useActiveWorkout();
  const { ready: restReady } = useLastRestSeconds();
  const { lastBackupAt, ready: lastReady } = useLastBackupAt();
  // Só libera os botões depois que tudo terminou de carregar do celular: importar antes disso
  // deixaria o carregamento atrasado sobrescrever os dados importados.
  const ready = routinesReady && historyReady && activeReady && restReady && lastReady;

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  const hasData = routines.length > 0 || workouts.length > 0 || workout != null;
  const exerciseCount = countExercises(routines);

  /** Roda uma ação dos botões: trava os botões enquanto roda e limpa a mensagem anterior. */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const exportBackup = () =>
    run(async () => {
      try {
        const backup = createBackup();
        await shareFile(backupFileName(backup.exportedAt), JSON.stringify(backup), FILE_TYPES.json, 'Salvar backup');
        markBackupExported(backup.exportedAt);
        setStatus({
          kind: 'ok',
          text: 'Backup criado. Guarde o arquivo fora do celular (Google Drive, WhatsApp, e-mail) para não perdê-lo junto com o app.',
        });
      } catch (error) {
        console.warn('Falha ao exportar o backup', error);
        setStatus({ kind: 'error', text: 'Não foi possível criar o backup. Tente de novo.' });
      }
    });

  const applyBackup = (backup: Backup) => {
    restoreBackup(backup);
    const { routines: r, workouts: w, activeWorkout } = backup.data;
    setStatus({ kind: 'ok', text: `Backup importado: ${describe(r.length, w.length, activeWorkout != null)}.` });
  };

  const importBackup = () =>
    run(async () => {
      try {
        const text = await pickTextFile();
        if (text == null) return; // cancelou o seletor
        const backup = parseBackup(text);
        const { routines: r, workouts: w, activeWorkout } = backup.data;
        const from = backup.exportedAt ? ` de ${formatWeekdayDate(backup.exportedAt)}` : '';

        // Sem dados neste celular (app recém-instalado) não há o que perder: importa direto
        if (!hasData) {
          applyBackup(backup);
          return;
        }
        confirmAction(
          'Substituir os dados?',
          `O backup${from} tem ${describe(r.length, w.length, activeWorkout != null)}. ` +
            `Ele vai substituir tudo o que está neste celular agora: ` +
            `${describe(routines.length, workouts.length, workout != null)}.`,
          'Substituir',
          () => applyBackup(backup),
        );
      } catch (error) {
        if (!(error instanceof BackupError)) console.warn('Falha ao importar o backup', error);
        setStatus({
          kind: 'error',
          text: error instanceof BackupError ? error.message : 'Não foi possível ler o arquivo escolhido.',
        });
      }
    });

  const exportExerciseList = () =>
    run(async () => {
      try {
        const now = Date.now();
        await shareFile(exerciseListFileName(now), buildExerciseListXlsx(routines), FILE_TYPES.xlsx, 'Salvar planilha');
        const withExercises = routines.filter((r) => r.exercises.length > 0).length;
        setStatus({
          kind: 'ok',
          text: `Planilha criada com ${plural(exerciseCount, 'exercício', 'exercícios')} de ${plural(withExercises, 'ficha', 'fichas')}. Abre no Excel ou no Google Planilhas.`,
        });
      } catch (error) {
        console.warn('Falha ao exportar a planilha', error);
        setStatus({ kind: 'error', text: 'Não foi possível criar a planilha. Tente de novo.' });
      }
    });

  return (
    <ScreenLayout title="Backup">
      <ScreenScrollView contentContainerStyle={styles.content}>
        <Card title="Seus dados" subtitle="Ficam salvos só neste celular">
          <Row label="Fichas" value={ready ? String(routines.length) : '…'} />
          <Row label="Exercícios nas fichas" value={ready ? String(exerciseCount) : '…'} />
          <Row label="Treinos no histórico" value={ready ? String(workouts.length) : '…'} />
          <Row label="Treino em andamento" value={!ready ? '…' : workout ? 'Sim' : 'Não'} />
          <Row label="Último backup" value={!ready ? '…' : lastBackupAt ? formatWeekdayDate(lastBackupAt) : 'Nunca'} />
        </Card>

        {status && (
          <View style={[styles.status, status.kind === 'error' ? styles.statusError : styles.statusOk]}>
            <Ionicons
              name={status.kind === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={22}
              color={status.kind === 'error' ? colors.accent.red[1] : colors.accent.green[1]}
            />
            <WiiText style={styles.statusText}>{status.text}</WiiText>
          </View>
        )}

        {/* Opção 1: levar tudo (fichas, histórico, treino em andamento) para outro celular */}
        <Card title="Trocar de celular" subtitle="Leve suas fichas e todo o histórico de treinos">
          <Step n={1} text="Neste celular, toque em Exportar backup e salve o arquivo no Google Drive (ou mande para você mesmo)." />
          <Step n={2} text="Instale o app no celular novo." />
          <Step n={3} text="No celular novo, abra Backup, toque em Importar backup e escolha o arquivo." />
          <WiiButton
            label="Exportar backup"
            icon="share-social"
            accent="purple"
            onPress={exportBackup}
            disabled={!ready || busy || !hasData}
          />
          <WiiButton
            label="Importar backup"
            icon="download"
            accent="purple"
            variant="outline"
            onPress={importBackup}
            disabled={!ready || busy}
          />
          <WiiText variant="label">
            Importar substitui todos os dados do app pelos do backup. Desinstalar o app apaga os dados: exporte antes.
          </WiiText>
        </Card>

        {/* Opção 2: só a lista de exercícios, numa planilha para ler, imprimir ou mandar */}
        <Card title="Exportar lista de exercícios" subtitle="Planilha (.xlsx) com todas as fichas e exercícios">
          <WiiText variant="label">
            Uma linha por exercício: ficha, séries, repetições, carga sugerida, tempo e observações. Abre no Excel ou no
            Google Planilhas.
          </WiiText>
          <WiiButton
            label="Exportar planilha"
            icon="grid"
            accent="green"
            onPress={exportExerciseList}
            disabled={!ready || busy || exerciseCount === 0}
          />
        </Card>
      </ScreenScrollView>
    </ScreenLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <WiiText style={styles.rowLabel}>{label}</WiiText>
      <WiiText style={styles.rowValue}>{value}</WiiText>
    </View>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <WiiText style={styles.stepNumber}>{n}</WiiText>
      <WiiText style={styles.stepText}>{text}</WiiText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.chart.grid,
  },
  rowLabel: { flex: 1 },
  rowValue: { fontFamily: fonts.black, fontSize: 17 },
  status: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.tileTop,
  },
  statusOk: { borderColor: colors.accent.green[1] },
  statusError: { borderColor: colors.accent.red[1] },
  statusText: { flex: 1, fontFamily: fonts.bold },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepNumber: { width: 18, fontFamily: fonts.black, color: colors.accent.purple[1] },
  stepText: { flex: 1 },
});
