// src/components/shared/Providers.tsx
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase } from '@/services/supabase/client'
import { obtenerPerfil } from '@/services/supabase/auth'
import { useSesionStore } from '@/stores/sesionStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   30_000,
      gcTime:      1000 * 60 * 60,
      retry:       2,
      retryDelay:  (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
    },
  },
})

function SesionListener() {
  const { setSesion, setCargando } = useSesionStore()

  useEffect(() => {
    let montado = true

    async function cargarSesionInicial() {
      try {
        setCargando(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (!montado) return

        if (session?.user) {
          const perfil = await obtenerPerfil(session.user.id)
          if (montado) {
            setSesion({
              id:      session.user.id,
              email:   session.user.email!,
              usuario: perfil,
            })
          }
        } else {
          if (montado) setSesion(null)
        }
      } catch {
        if (montado) setSesion(null)
      } finally {
        if (montado) setCargando(false)
      }
    }

    cargarSesionInicial()

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!montado) return

        if (event === 'SIGNED_OUT') {
          setSesion(null)
          setCargando(false)
          return
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            const perfil = await obtenerPerfil(session.user.id)
            if (montado) {
              setSesion({
                id:      session.user.id,
                email:   session.user.email!,
                usuario: perfil,
              })
            }
          } catch {
            if (montado) setSesion(null)
          } finally {
            if (montado) setCargando(false)
          }
        }
      }
    )

    return () => {
      montado = false
      subscription.unsubscribe()
    }
  }, [])

  return null
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SesionListener />
        {children}
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}