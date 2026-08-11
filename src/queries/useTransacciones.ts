// src/queries/useTransacciones.ts
import { useQuery } from '@tanstack/react-query'
import { obtenerTransacciones } from '@/services/supabase/transacciones'

export function useTransacciones(usuarioId: string | undefined) {
  return useQuery({
    queryKey:    ['transacciones', usuarioId],
    queryFn:     () => obtenerTransacciones(usuarioId!),
    enabled:     Boolean(usuarioId),
    staleTime:   30_000,
    networkMode: 'offlineFirst',
  })
}