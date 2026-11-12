import { useActiveWorkout } from '@/data/workouts';
import { useTimerNotification } from '@/utils/notifications';

/**
 * Mantém agendado o aviso de fim do descanso entre séries.
 * Fica na raiz do app (não na tela do treino): assim o aviso continua valendo quando você
 * sai para o menu ou abre outra tela no meio do descanso.
 */
export function RestNotification() {
  const { workout } = useActiveWorkout();
  useTimerNotification('rest', workout?.rest?.endsAt ?? null, 'Hora da próxima série!', 'Seu descanso acabou.');
  return null;
}
