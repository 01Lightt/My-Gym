import { ComingSoon } from '@/components/ComingSoon';
import { ScreenLayout } from '@/components/ScreenLayout';

export default function TreinarScreen() {
  return (
    <ScreenLayout title="Treinar">
      <ComingSoon description="Aqui você vai registrar os exercícios do dia: séries, repetições e carga." />
    </ScreenLayout>
  );
}
