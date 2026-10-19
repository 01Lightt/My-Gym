import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { RoutineCard } from '@/components/RoutineCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { WiiButton } from '@/components/WiiButton';
import { useRoutines } from '@/data/routines';
import { spacing } from '@/theme';

/** Lista de fichas (Treino A, B, C...). */
export default function FichasScreen() {
  const { routines, ready } = useRoutines();

  return (
    <ScreenLayout title="Fichas">
      <ScrollView contentContainerStyle={styles.content}>
        {ready && routines.length === 0 && (
          <EmptyState
            icon="clipboard"
            title="Nenhuma ficha ainda"
            description="Crie sua primeira ficha, como Treino A, B ou C, e adicione os exercícios."
          />
        )}

        {routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            onPress={() => router.push({ pathname: '/fichas/[id]', params: { id: routine.id } })}
          />
        ))}

        <WiiButton
          label="Nova ficha"
          icon="add"
          accent="green"
          onPress={() => router.push('/fichas/form')}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
});
