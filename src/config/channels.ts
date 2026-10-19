import type Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

import type { AccentName } from '@/theme';

/**
 * BLOCOS DO MENU PRINCIPAL (estilo canais do Wii).
 * Para adicionar, remover ou reordenar um bloco, edite só esta lista.
 * Ícones disponíveis: https://icons.expo.fyi (família Ionicons)
 */
export type Channel = {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  accent: AccentName;
  route: Href;
};

export const channels: Channel[] = [
  {
    id: 'treinar',
    title: 'Treinar',
    subtitle: 'Registrar treino',
    icon: 'barbell',
    accent: 'blue',
    route: '/treinar',
  },
  {
    id: 'fichas',
    title: 'Fichas',
    subtitle: 'Treino A, B, C...',
    icon: 'clipboard',
    accent: 'green',
    route: '/fichas',
  },
  {
    id: 'evolucao',
    title: 'Evolução',
    subtitle: 'Gráficos',
    icon: 'stats-chart',
    accent: 'orange',
    route: '/evolucao',
  },
  {
    id: 'timer',
    title: 'Descanso',
    subtitle: 'Cronômetro',
    icon: 'timer',
    accent: 'red',
    route: '/timer',
  },
];
