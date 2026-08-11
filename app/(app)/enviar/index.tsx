// app/(app)/enviar/index.tsx
import { useState, useCallback } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Search, User, Star } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Screen, AppText, Button, Input, Card, Badge } from '@/components/ui'
import { buscarPorUsername } from '@/services/supabase/usuarios'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'
import { useSesionStore } from '@/stores/sesionStore'

type EstadoBusqueda = 'idle' | 'buscando' | 'encontrado' | 'no_encontrado'

interface UsuarioEncontrado {
  id:         string
  username:   string
  nombre:     string | null
  direccion:  string | null
  puntuacion: number
}

export default function EnviarDestinatario() {
  const sesion   = useSesionStore(s => s.sesion)
  const [query,  setQuery]  = useState('')
  const [estado, setEstado] = useState<EstadoBusqueda>('idle')
  const [usuario, setUsuario] = useState<UsuarioEncontrado | null>(null)

  const handleBuscar = useCallback((texto: string) => {
    const limpio = texto.toLowerCase().replace(/[@\s]/g, '')
    setQuery(limpio)
    setUsuario(null)

    if (limpio.length < 3) {
      setEstado('idle')
      return
    }

    setEstado('buscando')

    const timer = setTimeout(async () => {
      try {
        const resultado = await buscarPorUsername(limpio)

        if (!resultado) {
          setEstado('no_encontrado')
          return
        }

        // No permitir enviarse a uno mismo
        if (resultado.id === sesion?.usuario?.id) {
          setEstado('no_encontrado')
          return
        }

        setUsuario(resultado as UsuarioEncontrado)
        setEstado('encontrado')
      } catch {
        setEstado('no_encontrado')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [sesion?.usuario?.id])

  function handleContinuar() {
    if (!usuario) return
    router.push({
      pathname: '/(app)/enviar/monto',
      params:   {
        destinatario_id:       usuario.id,
        destinatario_username: usuario.username,
        destinatario_nombre:   usuario.nombre ?? '',
        destinatario_puntuacion: String(usuario.puntuacion),
      },
    })
  }

  function renderEstadoBusqueda() {
    if (estado === 'buscando') {
      return (
        <View style={styles.estadoContainer}>
          <ActivityIndicator size="small" color={colors.teal} />
          <AppText variant="caption" color="secondary">
            Buscando @{query}...
          </AppText>
        </View>
      )
    }

    if (estado === 'no_encontrado') {
      return (
        <View style={styles.estadoContainer}>
          <AppText variant="caption" color="coral">
            No encontramos a @{query} en Chama
          </AppText>
        </View>
      )
    }

    if (estado === 'encontrado' && usuario) {
      return (
        <Card variant="default" style={styles.usuarioCard}>
          <View style={styles.usuarioInfo}>
            <View style={styles.avatarContainer}>
              <User size={iconSizes.lg} color={colors.teal} />
            </View>
            <View style={styles.usuarioDatos}>
              <AppText variant="subheading">
                @{usuario.username}
              </AppText>
              {usuario.nombre && (
                <AppText variant="caption" color="secondary">
                  {usuario.nombre}
                </AppText>
              )}
            </View>
            <View style={styles.reputacion}>
              <Star size={12} color={colors.gold} />
              <AppText variant="caption" color="secondary">
                {usuario.puntuacion > 0 ? '+' : ''}{usuario.puntuacion}
              </AppText>
            </View>
          </View>

          {usuario.puntuacion < 0 && (
            <View style={styles.advertencia}>
              <AppText variant="caption" color="gold">
                Este usuario tiene reputación negativa. Procede con cuidado.
              </AppText>
            </View>
          )}
        </Card>
      )
    }

    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="heading">Enviar USDT</AppText>
          <AppText variant="body" color="secondary">
            Escribe el username del destinatario
          </AppText>
        </View>

        <Input
          label="Destinatario"
          placeholder="@username"
          value={query}
          onChangeText={handleBuscar}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus
          icon={<Search size={iconSizes.md} color={colors.textTertiary} />}
        />

        {renderEstadoBusqueda()}

        <View style={styles.footer}>
          <Button
            label="Continuar"
            onPress={handleContinuar}
            disabled={estado !== 'encontrado' || !usuario}
          />
          <View style={{ height: spacing[3] }} />
          <Button
            label="Cancelar"
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  content: {
    flex:              1,
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
    gap:               spacing[5],
  },
  header: {
    gap: spacing[2],
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
    paddingLeft:   spacing[1],
  },
  usuarioCard: {
    gap: spacing[3],
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  avatarContainer: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  usuarioDatos: {
    flex: 1,
    gap:  spacing[1],
  },
  reputacion: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  advertencia: {
    backgroundColor: colors.goldLight,
    borderRadius:    radii.md,
    padding:         spacing[3],
    borderWidth:     1,
    borderColor:     colors.gold,
  },
  footer: {
    marginTop: 'auto',
  },
})