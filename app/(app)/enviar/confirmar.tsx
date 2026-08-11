// app/(app)/enviar/confirmar.tsx
import { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle, User } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, Button, Card, PinPad } from '@/components/ui'
import { enviarUSDT } from '@/services/supabase/transacciones'
import { useQueryClient } from '@tanstack/react-query'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'

type Paso = 'resumen' | 'pin' | 'enviando' | 'exito'

export default function EnviarConfirmar() {
  const params = useLocalSearchParams<{
    destinatario_id:         string
    destinatario_username:   string
    destinatario_nombre:     string
    destinatario_puntuacion: string
    monto:                   string
    monto_neto:              string
    comision:                string
  }>()

  const queryClient  = useQueryClient()
  const [paso,  setPaso]  = useState<Paso>('resumen')
  const [pin,   setPin]   = useState('')
  const [txId,  setTxId]  = useState('')
  const [error, setError] = useState('')

  const monto    = parseFloat(params.monto    ?? '0')
  const montoNeto = parseFloat(params.monto_neto ?? '0')
  const comision  = parseFloat(params.comision   ?? '0')

  async function handleConfirmar() {
    if (pin.length < 4) return

    setPaso('enviando')
    setError('')

    try {
      const resultado = await enviarUSDT({
        destinatario_username: params.destinatario_username,
        monto,
        pin,
      })

      setTxId(resultado.tx_id)

      // Invalidar queries para refrescar balance e historial
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transacciones'] })

      setPaso('exito')
    } catch (err: any) {
      setError(err.message)
      setPin('')
      setPaso('pin')
    }
  }

  // Pantalla de éxito
  if (paso === 'exito') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exitoContent}>
          <View style={styles.exitoIcono}>
            <CheckCircle size={64} color={colors.teal} strokeWidth={1.5} />
          </View>
          <AppText variant="heading" center>
            Envío en camino
          </AppText>
          <AppText variant="body" color="secondary" center>
            Enviaste {montoNeto.toFixed(2)} USDT a @{params.destinatario_username}
          </AppText>
          <View style={styles.exitoAcciones}>
            <Button
              label="Ver historial"
              onPress={() => {
                router.replace('/(app)/historial')
              }}
            />
            <View style={{ height: spacing[3] }} />
            <Button
              label="Volver al inicio"
              onPress={() => router.replace('/(app)/inicio')}
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // Pantalla de envío en progreso
  if (paso === 'enviando') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.enviandoContent}>
          <AppText variant="heading" center>Procesando...</AppText>
          <AppText variant="body" color="secondary" center>
            Firmando y transmitiendo la transacción
          </AppText>
        </View>
      </SafeAreaView>
    )
  }

  // Pantalla de PIN
  if (paso === 'pin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pinContent}>
          <View style={styles.header}>
            <AppText variant="heading" center>Confirma con tu PIN</AppText>
            <AppText variant="body" color="secondary" center>
              Enviando {montoNeto.toFixed(2)} USDT a @{params.destinatario_username}
            </AppText>
          </View>

          {error ? (
            <AppText variant="caption" color="coral" center>
              {error}
            </AppText>
          ) : null}

          <PinPad
            value={pin}
            onChange={(nuevoPin) => {
              setPin(nuevoPin)
              if (nuevoPin.length === 4) {
                // Auto-confirmar cuando el PIN está completo
                setTimeout(() => {
                  handleConfirmar()
                }, 100)
              }
            }}
          />

          <Button
            label="Cancelar"
            onPress={() => {
              setPin('')
              setPaso('resumen')
            }}
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    )
  }

  // Pantalla de resumen (paso inicial)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="heading">Confirmar envío</AppText>
          <AppText variant="body" color="secondary">
            Revisa los detalles antes de confirmar
          </AppText>
        </View>

        {/* Destinatario */}
        <Card variant="default" style={styles.destinatarioCard}>
          <AppText variant="caption" color="secondary">ENVIANDO A</AppText>
          <View style={styles.destinatarioInfo}>
            <View style={styles.avatarContainer}>
              <User size={iconSizes.lg} color={colors.teal} />
            </View>
            <View>
              <AppText variant="subheading">
                @{params.destinatario_username}
              </AppText>
              {params.destinatario_nombre ? (
                <AppText variant="caption" color="secondary">
                  {params.destinatario_nombre}
                </AppText>
              ) : null}
            </View>
          </View>
        </Card>

        {/* Desglose */}
        <Card variant="teal" style={styles.montoCard}>
          <AppText variant="caption" color="secondary" center>
            MONTO A ENVIAR
          </AppText>
          <AppText style={styles.montoGrande} color="teal" center>
            {montoNeto.toFixed(2)}
          </AppText>
          <AppText variant="caption" color="secondary" center>
            USDT
          </AppText>
        </Card>

        <Card variant="outlined" style={styles.desglose}>
          <View style={styles.desgloseRow}>
            <AppText variant="caption" color="secondary">Monto bruto</AppText>
            <AppText variant="caption">{monto.toFixed(2)} USDT</AppText>
          </View>
          <View style={styles.desgloseRow}>
            <AppText variant="caption" color="secondary">Comisión Chama (0.5%)</AppText>
            <AppText variant="caption" color="secondary">{comision.toFixed(4)} USDT</AppText>
          </View>
          <View style={[styles.desgloseRow, styles.desgloseTotál]}>
            <AppText variant="caption" bold>Recibirá</AppText>
            <AppText variant="caption" bold color="teal">{montoNeto.toFixed(2)} USDT</AppText>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            label="Confirmar con PIN"
            onPress={() => setPaso('pin')}
          />
          <View style={{ height: spacing[3] }} />
          <Button
            label="Cancelar"
            onPress={() => router.replace('/(app)/inicio')}
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
  destinatarioCard: {
    gap: spacing[3],
  },
  destinatarioInfo: {
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
  montoCard: {
    alignItems: 'center',
    gap:        spacing[1],
    padding:    spacing[6],
  },
  montoGrande: {
    fontSize:      48,
    fontWeight:    '800' as const,
    letterSpacing: -2,
  },
  desglose: {
    gap:     spacing[3],
    padding: spacing[4],
  },
  desgloseRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  desgloseTotál: {
    paddingTop:     spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop:      spacing[1],
  },
  footer: {
    marginTop: 'auto',
  },
  exitoContent: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: spacing[5],
    gap:               spacing[5],
  },
  exitoIcono: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  exitoAcciones: {
    width:     '100%',
    marginTop: spacing[4],
  },
  enviandoContent: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[4],
  },
  pinContent: {
    flex:              1,
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
    gap:               spacing[8],
  },
})