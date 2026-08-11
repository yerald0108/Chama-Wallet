// app/(app)/enviar/index.tsx
import { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Search, User, Star, CheckCircle } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, Button, Input, Card } from '@/components/ui'
import { buscarUsuariosPorUsername } from '@/services/supabase/usuarios'
import { useSesionStore } from '@/stores/sesionStore'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'

interface UsuarioEncontrado {
  id:         string
  username:   string
  nombre:     string | null
  puntuacion: number
}

export default function EnviarDestinatario() {
  const sesion = useSesionStore(s => s.sesion)

  const [query,       setQuery]       = useState('')
  const [sugerencias, setSugerencias] = useState<UsuarioEncontrado[]>([])
  const [buscando,    setBuscando]    = useState(false)
  const [seleccionado, setSeleccionado] = useState<UsuarioEncontrado | null>(null)

  const handleBuscar = useCallback((texto: string) => {
    const limpio = texto.toLowerCase().replace(/[@\s]/g, '')
    setQuery(limpio)
    setSeleccionado(null)
    setSugerencias([])

    if (limpio.length < 2) {
      setBuscando(false)
      return
    }

    setBuscando(true)

    const timer = setTimeout(async () => {
      try {
        const resultados = await buscarUsuariosPorUsername(limpio)

        // Filtrar al usuario actual
        const filtrados = resultados.filter(
          u => u.id !== sesion?.usuario?.id
        ) as UsuarioEncontrado[]

        setSugerencias(filtrados)
      } catch {
        setSugerencias([])
      } finally {
        setBuscando(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [sesion?.usuario?.id])

  function handleSeleccionar(usuario: UsuarioEncontrado) {
    setSeleccionado(usuario)
    setQuery(usuario.username)
    setSugerencias([])
  }

  function handleContinuar() {
    if (!seleccionado) return
    router.push({
      pathname: '/(app)/enviar/monto',
      params: {
        destinatario_id:         seleccionado.id,
        destinatario_username:   seleccionado.username,
        destinatario_nombre:     seleccionado.nombre ?? '',
        destinatario_puntuacion: String(seleccionado.puntuacion),
      },
    })
  }

  function renderSugerencia({ item }: { item: UsuarioEncontrado }) {
    const estaSeleccionado = seleccionado?.id === item.id

    return (
      <Pressable
        onPress={() => handleSeleccionar(item)}
        style={({ pressed }) => [
          styles.sugerencia,
          pressed           && styles.sugerenciaPresionada,
          estaSeleccionado  && styles.sugerenciaSeleccionada,
        ]}
      >
        <View style={[
          styles.avatar,
          estaSeleccionado && styles.avatarSeleccionado,
        ]}>
          <User
            size={iconSizes.md}
            color={estaSeleccionado ? colors.ink : colors.teal}
          />
        </View>

        <View style={styles.sugerenciaDatos}>
          <AppText variant="subheading">
            @{item.username}
          </AppText>
          {item.nombre ? (
            <AppText variant="caption" color="secondary">
              {item.nombre}
            </AppText>
          ) : null}
        </View>

        <View style={styles.sugerenciaDerecha}>
          <View style={styles.reputacion}>
            <Star size={11} color={colors.gold} />
            <AppText variant="caption" color="secondary">
              {item.puntuacion > 0 ? '+' : ''}{item.puntuacion}
            </AppText>
          </View>
          {estaSeleccionado && (
            <CheckCircle size={20} color={colors.teal} />
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.header}>
          <AppText variant="heading">Enviar USDT</AppText>
          <AppText variant="body" color="secondary">
            Busca al destinatario por su username
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
          icon={
            buscando
              ? <ActivityIndicator size="small" color={colors.teal} />
              : <Search size={iconSizes.md} color={colors.textTertiary} />
          }
        />

        {/* Lista de sugerencias */}
        {sugerencias.length > 0 && (
          <Card variant="default" style={styles.sugerenciasCard}>
            <FlatList
              data={sugerencias}
              keyExtractor={item => item.id}
              renderItem={renderSugerencia}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View style={styles.separador} />
              )}
            />
          </Card>
        )}

        {/* Sin resultados */}
        {!buscando && query.length >= 2 && sugerencias.length === 0 && !seleccionado && (
          <AppText variant="caption" color="secondary" style={styles.sinResultados}>
            No encontramos usuarios con ese nombre
          </AppText>
        )}

        {/* Usuario seleccionado confirmado */}
        {seleccionado && (
          <Card variant="teal" style={styles.seleccionadoCard}>
            <View style={styles.seleccionadoInfo}>
              <View style={styles.avatarSeleccionadoGrande}>
                <User size={iconSizes.lg} color={colors.teal} />
              </View>
              <View style={styles.seleccionadoDatos}>
                <AppText variant="caption" color="secondary">
                  ENVIANDO A
                </AppText>
                <AppText variant="subheading">
                  @{seleccionado.username}
                </AppText>
                {seleccionado.nombre ? (
                  <AppText variant="caption" color="secondary">
                    {seleccionado.nombre}
                  </AppText>
                ) : null}
              </View>
              <CheckCircle size={24} color={colors.teal} />
            </View>

            {seleccionado.puntuacion < 0 && (
              <View style={styles.advertencia}>
                <AppText variant="caption" color="gold">
                  Este usuario tiene reputación negativa. Procede con cuidado.
                </AppText>
              </View>
            )}
          </Card>
        )}

        <View style={styles.footer}>
          <Button
            label="Continuar"
            onPress={handleContinuar}
            disabled={!seleccionado}
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
    gap:               spacing[4],
  },
  header: {
    gap: spacing[2],
  },
  sugerenciasCard: {
    padding: 0,
    overflow: 'hidden',
  },
  sugerencia: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[3],
    padding:        spacing[4],
  },
  sugerenciaPresionada: {
    backgroundColor: colors.ink3,
  },
  sugerenciaSeleccionada: {
    backgroundColor: colors.tealLight,
  },
  separador: {
    height:          1,
    backgroundColor: colors.borderSubtle,
    marginLeft:      spacing[4] + 40 + spacing[3],
  },
  avatar: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarSeleccionado: {
    backgroundColor: colors.teal,
  },
  sugerenciaDatos: {
    flex: 1,
    gap:  2,
  },
  sugerenciaDerecha: {
    alignItems: 'flex-end',
    gap:        spacing[1],
  },
  reputacion: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },
  sinResultados: {
    paddingLeft: spacing[1],
  },
  seleccionadoCard: {
    gap: spacing[3],
  },
  seleccionadoInfo: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  avatarSeleccionadoGrande: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  seleccionadoDatos: {
    flex: 1,
    gap:  2,
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