import type Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

import type { AccentName } from '@/theme';

/**
 * BLOCOS DO MENU PRINCIPAL (estilo canais do Wii).
 * Para adicionar, remover ou reordenar um bloco, edite só esta lista.
 * Os espaços que sobram na grade viram blocos vazios, como no Menu do Wii.
 * Ícones disponíveis: https://icons.expo.fyi (família Ionicons)
 */

/** Quantos blocos a grade do menu mostra no total (canais + vazios). Se houver mais canais, todos aparecem. */
export const GRID_SLOTS = 6;

export type Channel = {
  id: string;
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  accent: AccentName;
  route: Href;
};

export const channels: Channel[] = [
  {
    id: 'treinar',
    title: 'Treinar',
    icon: 'barbell',
    accent: 'blue',
    route: '/treinar',
  },
  {
    id: 'fichas',
    title: 'Fichas',
    icon: 'clipboard',
    accent: 'green',
    route: '/fichas',
  },
  {
    id: 'evolucao',
    title: 'Evolução',
    icon: 'stats-chart',
    accent: 'orange',
    route: '/evolucao',
  },
  {
    id: 'timer',
    title: 'Timer',
    icon: 'timer',
    accent: 'red',
    route: '/timer',
  },
  {
    // Trocar de celular (exportar/importar todos os dados) e exportar a lista de exercícios em planilha
    id: 'backup',
    title: 'Backup',
    icon: 'cloud-upload',
    accent: 'purple',
    route: '/backup',
  },
];
