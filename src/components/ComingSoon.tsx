import { EmptyState } from '@/components/EmptyState';

/** Aviso temporário para telas que ainda vão ser construídas. */
export function ComingSoon({ description }: { description: string }) {
  return <EmptyState icon="construct" title="Em construção" description={description} />;
}
