import { ComingSoon } from '@/components/ComingSoon';
import { ScreenLayout } from '@/components/ScreenLayout';

export default function EvolucaoScreen() {
  return (
    <ScreenLayout title="Evolução">
      <ComingSoon description="Aqui vão aparecer os gráficos da sua carga e do volume ao longo do tempo." />
    </ScreenLayout>
  );
}
