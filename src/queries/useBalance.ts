// src/queries/useBalance.ts
import { useQuery } from '@tanstack/react-query'
import { obtenerBalanceUSDT } from '@/services/blockchain/balance'
import { useOfflineStore } from '@/stores/offlineStore'
import { LIMITES } from '@/utils/constantes'

export function useBalance(direccion: string | null | undefined) {
  const setUltimoBalance = useOfflineStore(s => s.setUltimoBalance)

  return useQuery({
    queryKey:       ['balance', direccion],
    queryFn:        async () => {
      if (!direccion) return '0.00'
      const balance = await obtenerBalanceUSDT(direccion)
      // Guardar en cache offline
      setUltimoBalance(balance)
      return balance
    },
    enabled:        Boolean(direccion),
    refetchInterval: LIMITES.polling_balance,
    staleTime:      LIMITES.polling_balance,
    networkMode:    'offlineFirst',
  })
}