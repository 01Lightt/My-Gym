import { strToU8, zipSync } from 'fflate';

/**
 * Gerador de planilha .xlsx (Excel / Google Planilhas) com uma aba, feito à mão.
 *
 * Um .xlsx é um arquivo zip com alguns XMLs dentro (formato Office Open XML). Para uma tabela
 * simples bastam os 6 arquivos abaixo, então o app monta os XMLs e só usa a fflate para zipar,
 * em vez de uma biblioteca de planilhas inteira (bem maiores e com mais coisa do que precisamos).
 *
 * O que a planilha tem: cabeçalho em negrito com fundo azul claro, a primeira linha congelada
 * (fica visível ao rolar), filtro nas colunas e a largura de cada coluna.
 */

export type XlsxColumn = { header: string; /** Largura em caracteres. */ width: number };
/** Uma célula: texto, número ou vazia (null). */
export type XlsxCell = string | number | null;

/** Índice de estilo do cabeçalho em styles.xml (0 = normal). */
const HEADER_STYLE = 1;

/** Texto seguro para XML: escapa & < > " e remove caracteres de controle que o Excel recusa. */
function xmlText(text: string) {
  return (
    text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  );
}

/** Letra da coluna: 0 → A, 25 → Z, 26 → AA. */
function columnLetter(index: number) {
  let letters = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  }
  return letters;
}

function cellXml(ref: string, value: XlsxCell, style = 0) {
  const s = style ? ` s="${style}"` : '';
  if (value == null || value === '') return '';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `<c r="${ref}"${s}><v>${value}</v></c>` : '';
  }
  // Texto "inline" (dentro da própria célula): dispensa a tabela de textos compartilhados
  return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xmlText(value)}</t></is></c>`;
}

function rowXml(rowNumber: number, cells: XlsxCell[], style = 0) {
  const content = cells.map((value, i) => cellXml(`${columnLetter(i)}${rowNumber}`, value, style)).join('');
  return `<row r="${rowNumber}">${content}</row>`;
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';

/** Monta a planilha e devolve os bytes do arquivo .xlsx. */
export function buildXlsx(sheetName: string, columns: XlsxColumn[], rows: XlsxCell[][]): Uint8Array {
  const lastColumn = columnLetter(columns.length - 1);
  const lastRow = rows.length + 1;
  const range = `A1:${lastColumn}${lastRow}`;
  // Nome da aba: até 31 caracteres e sem : \ / ? * [ ] (regras do Excel)
  const safeSheetName = sheetName.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31) || 'Planilha';

  const sheet =
    XML_HEADER +
    `<worksheet xmlns="${NS_MAIN}">` +
    `<dimension ref="${range}"/>` +
    // Primeira linha congelada
    '<sheetViews><sheetView workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '</sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="15"/>' +
    '<cols>' +
    columns.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join('') +
    '</cols>' +
    '<sheetData>' +
    rowXml(
      1,
      columns.map((c) => c.header),
      HEADER_STYLE,
    ) +
    rows.map((cells, i) => rowXml(i + 2, cells)).join('') +
    '</sheetData>' +
    `<autoFilter ref="${range}"/>` +
    '</worksheet>';

  const workbook =
    XML_HEADER +
    `<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}">` +
    `<sheets><sheet name="${xmlText(safeSheetName)}" sheetId="1" r:id="rId1"/></sheets>` +
    // O Excel guarda a área do filtro neste nome oculto
    `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">` +
    `'${xmlText(safeSheetName.replace(/'/g, "''"))}'!$A$1:$${lastColumn}$${lastRow}` +
    '</definedName></definedNames>' +
    '</workbook>';

  const styles =
    XML_HEADER +
    `<styleSheet xmlns="${NS_MAIN}">` +
    '<fonts count="2">' +
    '<font><sz val="11"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="11"/><name val="Calibri"/></font>' +
    '</fonts>' +
    // Os dois primeiros preenchimentos são obrigatórios; o terceiro é o azul claro do cabeçalho
    '<fills count="3">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFD9F2FB"/><bgColor indexed="64"/></patternFill></fill>' +
    '</fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';

  const contentTypes =
    XML_HEADER +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '</Types>';

  const rootRels =
    XML_HEADER +
    `<Relationships xmlns="${NS_PKG_REL}">` +
    `<Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/>` +
    '</Relationships>';

  const workbookRels =
    XML_HEADER +
    `<Relationships xmlns="${NS_PKG_REL}">` +
    `<Relationship Id="rId1" Type="${NS_REL}/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="${NS_REL}/styles" Target="styles.xml"/>` +
    '</Relationships>';

  return zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(rootRels),
    'xl/workbook.xml': strToU8(workbook),
    'xl/_rels/workbook.xml.rels': strToU8(workbookRels),
    'xl/styles.xml': strToU8(styles),
    'xl/worksheets/sheet1.xml': strToU8(sheet),
  });
}
