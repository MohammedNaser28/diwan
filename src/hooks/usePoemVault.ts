import { usePoemVaultContext } from '../context/PoemVaultContext';

/**
 * Hook to access the global Poem Vault state.
 * All instances of this hook share the same data and sync status.
 */
export function usePoemVault() {
  return usePoemVaultContext();
}
