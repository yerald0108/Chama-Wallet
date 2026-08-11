// app/(app)/enviar/monto.tsx
import { useState } from 'react'
import { View, StyleSheet, TextInput } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { User } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, Button, Card } from '@/components/ui'
import { useBalance } from '@/queries/useBalance'
import { useSesionStore } from '@/stores/sesionStore'
import { colors, spacing, typography, radii, iconSizes } from '@/theme/tokens'

const COMISION = 0.005  // 0.5%

export default function EnviarMonto() {
  const params  = useLocalSearchParams<{
    destinatario_id:         string
    destinatario_username:   string
    destinatario_nombre:     string
    destinatario_puntuacion: string
  }>()

  const sesion    = useSesionStore(s => s.sesion)
  const [monto,   setMonto]   = useState('')
  const [error,   setError]   = useState('')

  const { data: balance } = useBalance(sesion?.usuario?.direccion)
  const balanceNum = parseFloat(balance ?? '0')

  const montoNum   = parseFloat(monto) || 0
  const comision   = montoNum * COMISION
  const montoNeto  = montoNum - comision
  const costoTotal = montoNum

  function handleMontoChange(texto: string) {
    // Solo permitir números y un punto decimal
    const limpio = texto.replace(/[^0-9.]/g, '')
    const partes = limpio.split('.')
    if (partes.length > 2) return
    if (partes[1]?.length > 2) return
    setMonto(limpio)
    setError('')
  }

  function handleMax() {
    const max = Math.max(0, balanceNum - 0.01).toFixed(2)
    setMonto(max)
  }

  function handleContinuar() {
    if (montoNum <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    if (montoNum < 0.01) {
      setError('El mínimo es 0.01 USDT')
      return
    }
    if (costoTotal > balanceNum) {
      setError('Saldo insuficiente')
      return
    }

    router.push({
      pathname: '/(app)/enviar/confirmar',
      params:   {
        ...params,
        monto:        String(montoNum),
        monto_neto:   String(montoNeto.toFixed(6)),
        comision:     String(comision.toFixed(6)),
      },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.header}>
          <AppText variant="heading">¿Cuánto envías?</AppText>
          <AppText variant="body" color="secondary">
            A @{params.destinatario_username}
          </AppText>
        </View>

        {/* Input de monto grande */}
        <View style={styles.montoContainer}>
          <View style={styles.montoRow}>
            <TextInput
              style={styles.montoInput}
              value={monto}
              onChangeText={handleMontoChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <AppText variant="subheading" color="secondary">
              USDT
            </AppText>
          </View>

          {error ? (
            <AppText variant="caption" color="coral" center>
              {error}
            </AppText>
          ) : null}
        </View>

        {/* Balance disponible */}
        <View style={styles.balanceRow}>
          <AppText variant="caption" color="secondary">
            Disponible: {balanceNum.toFixed(2)} USDT
          </AppText>
          <Button
            label="Máx"
            onPress={handleMax}
            variant="ghost"
            size="sm"
            fullWidth={false}
          />
        </View>

        {/* Desglose */}
        {montoNum > 0 && (
          <Card variant="outlined" style={styles.desglose}>
            <View style={styles.desgloseRow}>
              <AppText variant="caption" color="secondary">Recibirá</AppText>
              <AppText variant="caption" bold>{montoNeto.toFixed(2)} USDT</AppText>
            </View>
            <View style={styles.desgloseRow}>
              <AppText variant="caption" color="secondary">Comisión (0.5%)</AppText>
              <AppText variant="caption" color="secondary">{comision.toFixed(4)} USDT</AppText>
            </View>
            <View style={[styles.desgloseRow, styles.desgloseTotal]}>
              <AppText variant="caption" bold>Total a descontar</AppText>
              <AppText variant="caption" bold color="teal">{costoTotal.toFixed(2)} USDT</AppText>
            </View>
          </Card>
        )}

        <View style={styles.footer}>
          <Button
            label="Continuar"
            onPress={handleContinuar}
            disabled={montoNum <= 0}
          />
          <View style={{ height: spacing[3] }} />
          <Button
            label="Volver"
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
  montoContainer: {
    alignItems: 'center',
    gap:        spacing[2],
    paddingVertical: spacing[6],
  },
  montoRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           spacing[2],
  },
  montoInput: {
    fontSize:      56,
    fontWeight:    '800' as const,
    color:         colors.textPrimary,
    letterSpacing: -2,
    minWidth:      80,
    textAlign:     'right',
  },
  balanceRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  desglose: {
    gap:     spacing[2],
    padding: spacing[4],
  },
  desgloseRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  desgloseTotal: {
    paddingTop:  spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop:   spacing[1],
  },
  footer: {
    marginTop: 'auto',
  },
})