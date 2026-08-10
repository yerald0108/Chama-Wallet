// src/hooks/useSetupWallet.ts
import { useState, useEffect } from 'react'
import { generarWallet } from '@/services/blockchain/wallet'
import { guardarWallet } from '@/services/supabase/usuarios'
import { hashPin } from '@/services/seguridad/cifrado'
import { useSesionStore } from '@/stores/sesionStore'

type EstadoSetup = 'idle' | 'generando' | 'guardando' | 'listo' | 'error'

export function useSetupWallet() {
  const [estado, setEstado] = useState<EstadoSetup>('idle')
  const [error,  setError]  = useState<string | null>(null)

  const sesion         = useSesionStore(s => s.sesion)
  const pinTemporal    = useSesionStore(s => s.pinTemporal)
  const setPinTemporal = useSesionStore(s => s.setPinTemporal)

  useEffect(() => {
    // Esperar a que sesion esté cargada Y haya PIN temporal
    // Y que el usuario no tenga wallet aún
    if (!sesion?.id || !pinTemporal || sesion.usuario?.direccion) return

    let cancelado = false

    async function setup() {
      try {
        if (!cancelado) setEstado('generando')

        const walletInfo = await generarWallet(pinTemporal!)
        if (cancelado) return

        setEstado('guardando')

        const pinHash = await hashPin(pinTemporal!)
        await guardarWallet(sesion!.id, walletInfo, pinHash)
        if (cancelado) return

        setPinTemporal(null)
        setEstado('listo')
      } catch (err: any) {
        if (!cancelado) {
          setError(err.message)
          setEstado('error')
          setPinTemporal(null)
        }
      }
    }

    setup()

    return () => { cancelado = true }

  // Se ejecuta cuando sesion.id aparece O cuando pinTemporal cambia
  }, [sesion?.id, sesion?.usuario?.direccion, pinTemporal])

  return { estado, error }
}