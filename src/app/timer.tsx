import { ComingSoon } from '@/components/ComingSoon';
import { ScreenLayout } from '@/components/ScreenLayout';

export default function TimerScreen() {
  return (
    <ScreenLayout title="Descanso">
      <ComingSoon description="Aqui vai ficar o cronômetro de descanso entre as séries." />
    </ScreenLayout>
  );
}
