// src/hooks/useRealtime.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { supabase } from '@/services/supabase/client'
import { useSesionStore } from '@/stores/sesionStore'
import { useUIStore } from '@/stores/uiStore'

export function useRealtime() {
  const sesion       = useSesionStore(s => s.sesion)
  const queryClient  = useQueryClient()
  const mostrarToast = useUIStore(s => s.mostrarToast)

  useEffect(() => {
    if (!sesion?.usuario?.id) return

    const usuarioId = sesion.usuario.id

    const canal = supabase
      .channel('transacciones_realtime_' + usuarioId)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'transacciones',
        },
        async (payload) => {
          const tx = payload.new as Record<string, unknown>

          // Solo procesar txs que involucran al usuario actual
          const esDestinatario = tx.destinatario_id === usuarioId
          const esRemitente    = tx.remitente_id    === usuarioId

          if (!esDestinatario && !esRemitente) return

          // Refrescar balance e historial siempre
          queryClient.invalidateQueries({ queryKey: ['balance'] })
          queryClient.invalidateQueries({ queryKey: ['transacciones'] })

          if (tx.estado === 'confirmada') {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            )

            if (esDestinatario) {
              mostrarToast({
                tipo:    'exito',
                mensaje: `Recibiste ${Number(tx.monto).toFixed(2)} USDT`,
              })
            } else {
              mostrarToast({
                tipo:    'exito',
                mensaje: `Tu envío de ${Number(tx.monto).toFixed(2)} USDT fue confirmado`,
              })
            }
          }

          if (tx.estado === 'fallida') {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            )
            mostrarToast({
              tipo:    'error',
              mensaje: tx.error_msg as string || 'La transacción falló',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [sesion?.usuario?.id])
}