// src/components/transacciones/ModalReputacion.tsx
import { useState, useEffect } from 'react'
import { View, Modal, StyleSheet, Pressable, ActivityIndicator, Animated } from 'react-native'
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { AppText, Button } from '@/components/ui'
import { calificarUsuario, yaCalifique } from '@/services/supabase/reputacion'
import { colors, spacing, iconSizes, radii, shadows } from '@/theme/tokens'

interface ModalReputacionProps {
  visible:          boolean
  onCerrar:         () => void
  evaluadorId:      string
  evaluadoId:       string
  evaluadoUsername: string
  transaccionId:    string
}

export function ModalReputacion({
  visible,
  onCerrar,
  evaluadorId,
  evaluadoId,
  evaluadoUsername,
  transaccionId,
}: ModalReputacionProps) {
  const [cargando,    setCargando]   = useState(false)
  const [calificado,  setCalificado] = useState(false)
  const [yaHecho,     setYaHecho]    = useState(false)
  const [valorDado,   setValorDado]  = useState<1 | -1 | null>(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    if (visible) {
      setCargando(false)
      setCalificado(false)
      setValorDado(null)
      setVerificando(true)
      setYaHecho(false)

      async function verificar() {
        try {
          const hecho = await yaCalifique(evaluadorId, transaccionId)
          setYaHecho(hecho)
        } catch {
          setYaHecho(false)
        } finally {
          setVerificando(false)
        }
      }
      verificar()
    }
  }, [visible, evaluadorId, transaccionId])

  async function handleCalificar(valor: 1 | -1) {
    setCargando(true)
    try {
      const hecho = await yaCalifique(evaluadorId, transaccionId)
      if (hecho) {
        setYaHecho(true)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        return
      }

      await calificarUsuario(evaluadorId, evaluadoId, transaccionId, valor)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setValorDado(valor)
      setCalificado(true)
    } catch {
      setCalificado(true)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCerrar}
    >
      <Pressable style={styles.overlay} onPress={onCerrar}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          {verificando ? (
            <ActivityIndicator
              size="small"
              color={colors.teal}
              style={{ paddingVertical: spacing[4] }}
            />
          ) : yaHecho ? (
            <View style={styles.yaHechoContent}>
              <CheckCircle size={32} color={colors.teal} />
              <AppText variant="subheading" center>
                Ya calificaste esta transacción
              </AppText>
              <AppText variant="caption" color="secondary" center>
                Solo puedes calificar una vez por transacción
              </AppText>
              <Button label="Entendido" onPress={onCerrar} size="sm" />
            </View>
          ) : calificado ? (
            <View style={styles.graciasContent}>
              <CheckCircle size={32} color={colors.teal} />
              <AppText variant="subheading" center>
                {valorDado === 1 ? '¡Gracias!' : 'Gracias por tu honestidad'}
              </AppText>
              <AppText variant="caption" color="secondary" center>
                Tu calificación ayuda a la comunidad Chama
              </AppText>
              <Button label="Cerrar" onPress={onCerrar} size="sm" />
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <AppText variant="subheading" center>
                  Calificar a @{evaluadoUsername}
                </AppText>
                <AppText variant="caption" color="secondary" center>
                  ¿Cómo fue la experiencia?
                </AppText>
              </View>

              {cargando ? (
                <ActivityIndicator size="small" color={colors.teal} />
              ) : (
                <View style={styles.botones}>
                  <Pressable
                    onPress={() => handleCalificar(1)}
                    style={({ pressed }) => [
                      styles.boton,
                      styles.botonPositivo,
                      pressed && styles.botonPresionado,
                    ]}
                  >
                    <ThumbsUp size={iconSizes.lg} color={colors.teal} />
                    <AppText variant="caption" color="teal" bold>
                      Positivo
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => handleCalificar(-1)}
                    style={({ pressed }) => [
                      styles.boton,
                      styles.botonNegativo,
                      pressed && styles.botonPresionado,
                    ]}
                  >
                    <ThumbsDown size={iconSizes.lg} color={colors.coral} />
                    <AppText variant="caption" color="coral" bold>
                      Negativo
                    </AppText>
                  </Pressable>
                </View>
              )}

              <Button
                label="Omitir"
                onPress={onCerrar}
                variant="ghost"
                size="sm"
              />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing[5],
  },
  card: {
    width:           '100%',
    backgroundColor: colors.ink2,
    borderRadius:    radii.xl,
    borderWidth:     1,
    borderColor:     colors.borderDefault,
    padding:         spacing[6],
    gap:             spacing[5],
    alignItems:      'center',
    ...shadows.lg,
  },
  header: {
    gap:   spacing[2],
    width: '100%',
  },
  botones: {
    flexDirection: 'row',
    gap:           spacing[3],
    width:         '100%',
  },
  boton: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[2],
    paddingVertical: spacing[5],
    borderRadius:   radii.lg,
    borderWidth:    1.5,
  },
  botonPositivo: {
    backgroundColor: colors.tealLight,
    borderColor:     colors.teal,
  },
  botonNegativo: {
    backgroundColor: colors.coralLight,
    borderColor:     colors.coral,
  },
  botonPresionado: {
    opacity: 0.7,
  },
  yaHechoContent: {
    alignItems: 'center',
    gap:        spacing[4],
    width:      '100%',
  },
  graciasContent: {
    alignItems: 'center',
    gap:        spacing[4],
    width:      '100%',
  },
})