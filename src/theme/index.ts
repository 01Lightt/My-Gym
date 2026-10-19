/**
 * TEMA DO APP — mude aqui as cores, fontes e tamanhos e o app inteiro acompanha.
 * Inspirado no visual do Wii / Wii Sports: branco, cinza-claro, azul Wii e cantos bem arredondados.
 */

export const colors = {
  // Fundo do menu (gradiente de cima para baixo)
  backgroundTop: '#FFFFFF',
  backgroundBottom: '#DDE6EE',
  backgroundLines: 'rgba(160, 180, 195, 0.12)',

  // Azul característico do Wii
  primary: '#34BEED',
  primaryDark: '#0A8FC6',
  primaryLight: '#BDEBFB',

  // Textos
  text: '#4D5560',
  textMuted: '#8C9AA5',
  textOnColor: '#FFFFFF',

  // Blocos (canais)
  tileTop: '#FFFFFF',
  tileBottom: '#EEF2F5',
  tileBorder: '#C9D3DB',

  // Barra inferior
  barTop: '#F6F8FA',
  barBottom: '#D5DEE5',
  barBorder: '#BCC7D0',

  // Cores de destaque de cada canal
  accent: {
    blue: ['#5CD0F5', '#1A9BD7'],
    green: ['#9BE05A', '#4DAA1E'],
    orange: ['#FFC15C', '#F08A12'],
    red: ['#FF8A8A', '#E04848'],
    purple: ['#C7A3F0', '#8C5CD1'],
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
  pill: 999,
} as const;

export const shadows = {
  tile: '0px 4px 10px rgba(80, 110, 135, 0.18)',
  button: '0px 3px 6px rgba(10, 100, 150, 0.30)',
  bar: '0px -3px 12px rgba(80, 110, 135, 0.15)',
} as const;
