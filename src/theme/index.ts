/**
 * TEMA DO APP — mude aqui as cores, fontes e tamanhos e o app inteiro acompanha.
 * Baseado no Menu do Wii: fundo cinza neutro listrado, "chrome" branco/cinza,
 * azul-ciano só em contornos e destaques, cor forte só dentro dos canais.
 */

export const colors = {
  // Fundo (gradiente de cima para baixo + listras finas de 1px, como o Menu do Wii)
  backgroundTop: '#F2F2F2',
  backgroundBottom: '#E3E3E3',
  backgroundLines: 'rgba(0, 0, 0, 0.035)',

  // Azul-ciano característico do Wii (contornos, linhas, seleção)
  primary: '#34BEED',
  primaryDark: '#1A9BD7',
  primaryLight: '#DDF4FC',

  // Textos (cinza neutro, como no Wii)
  text: '#4F4F4F',
  textMuted: '#8C8C8C',
  textOnColor: '#FFFFFF',

  // Cartões e campos
  tileTop: '#FFFFFF',
  tileBottom: '#F0F0F0',
  tileBorder: '#CFCFCF',

  // Espaços vazios da grade do menu (blocos cinza com "Wii" em relevo)
  emptySlot: ['#CDCDCE', '#BCBDBE'],
  emptySlotBorder: '#DADADA',
  emptySlotText: 'rgba(255, 255, 255, 0.5)',

  // Barra inferior do menu
  barTop: '#E2E2E5',
  barBottom: '#CDCFD7',
  barLine: '#34BEED',
  clock: '#8E8F91',

  // Ações perigosas (excluir)
  danger: '#E04848',

  // Gráficos: uma única cor para os dados (validada contra o fundo branco), grade discreta
  chart: {
    data: '#1A9BD7',
    grid: '#E5E5E5',
    empty: '#E6E6E6',
  },

  // Cores de destaque (gradiente claro → escuro), usadas dentro dos canais, fichas e ícones
  accent: {
    blue: ['#5CD0F5', '#1A9BD7'],
    green: ['#9BE05A', '#4DAA1E'],
    orange: ['#FFC15C', '#F08A12'],
    red: ['#FF8A8A', '#E04848'],
    purple: ['#C7A3F0', '#8C5CD1'],
    pink: ['#FFA3D1', '#E0559B'],
    teal: ['#6EE0D0', '#18A99A'],
  },
} as const;

export type AccentName = keyof typeof colors.accent;

export const fonts = {
  regular: 'MPLUSRounded1c_500Medium',
  bold: 'MPLUSRounded1c_800ExtraBold',
  black: 'MPLUSRounded1c_900Black',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 18,
  lg: 26,
  /** Canais do menu: cantos pouco arredondados, como no Wii. */
  channel: 12,
  pill: 999,
} as const;

export const shadows = {
  tile: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  button: '0px 2px 5px rgba(0, 0, 0, 0.18)',
  channel: '0px 1px 3px rgba(0, 0, 0, 0.25)',
  /** Brilho ciano em volta do que está ativo/selecionado. */
  glow: '0px 0px 6px rgba(52, 190, 237, 0.55)',
} as const;
