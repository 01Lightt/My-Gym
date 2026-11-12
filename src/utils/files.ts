import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Arquivos que o app gera ou lê no celular: salvar pelo menu de compartilhar (backup e
 * planilha de exercícios) e escolher um arquivo para importar (backup).
 * O conteúdo de cada arquivo é montado em data/backup.ts e data/exerciseList.ts.
 */

/** Tipos de arquivo que o app compartilha (mimeType para o Android, UTI para o iPhone). */
export const FILE_TYPES = {
  json: { mimeType: 'application/json', uti: 'public.json' },
  xlsx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uti: 'org.openxmlformats.spreadsheetml.sheet',
  },
} as const;

type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

/** Um backup tem poucos KB; um arquivo muito maior com certeza não é um backup. */
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

/**
 * Grava o conteúdo num arquivo temporário e abre o menu de compartilhar do celular, de onde
 * dá para salvar no Google Drive, mandar no WhatsApp, por e-mail etc.
 * Na prévia web (navegador), baixa o arquivo direto.
 */
export async function shareFile(fileName: string, content: string | Uint8Array, type: FileType, dialogTitle: string) {
  if (Platform.OS === 'web') {
    downloadOnWeb(fileName, content, type.mimeType);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  }
  // Fica no cache do app e é sobrescrito na próxima vez: não apaga logo depois porque o app
  // escolhido (Drive, WhatsApp...) pode terminar de ler o arquivo só depois que o menu fecha.
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType: type.mimeType, UTI: type.uti, dialogTitle });
}

/**
 * Abre o seletor de arquivos e devolve o texto do arquivo escolhido (ou null se cancelou).
 * Aceita qualquer tipo: arquivos vindos do Drive ou do WhatsApp às vezes chegam sem o tipo
 * "JSON" e ficariam escondidos no seletor; o conteúdo é validado depois (parseBackup).
 */
export async function pickTextFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  if (asset.size != null && asset.size > MAX_IMPORT_BYTES) {
    throw new Error('Este arquivo é grande demais para ser um backup do app.');
  }
  if (Platform.OS === 'web') {
    return asset.file ? asset.file.text() : (await fetch(asset.uri)).text();
  }
  return new File(asset.uri).text();
}

function downloadOnWeb(fileName: string, content: string | Uint8Array, mimeType: string) {
  // Copia os bytes para um ArrayBuffer comum (o Blob não aceita qualquer tipo de buffer)
  const part = typeof content === 'string' ? content : content.slice().buffer;
  const url = URL.createObjectURL(new Blob([part], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
