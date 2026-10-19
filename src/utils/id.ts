/** Gera um identificador único simples para registros salvos no aparelho. */
export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
