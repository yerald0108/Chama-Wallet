// app/(app)/inicio.tsx
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native'
import { router } from 'expo-router'
import { Screen, AppText, Card, Button } from '@/components/ui'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { BalanceSkeleton } from '@/components/wallet/BalanceSkeleton'
import { useBalance } from '@/queries/useBalance'
import { useSesionStore } from '@/stores/sesionStore'
import { useOfflineStore } from '@/stores/offlineStore'
import { useConectividad } from '@/hooks/useConectividad'
import { colors, spacing, iconSizes } from '@/theme/tokens'

export default function Inicio() {
  const sesion       = useSesionStore(s => s.sesion)
  const ultimoBalance = useOfflineStore(s => s.ultimoBalance)
  const ultimaActualizacion = useOfflineStore(s => s.ultimaActualizacion)
  const online       = useOfflineStore(s => s.online)

  // Activar listener de conectividad
  useConectividad()

  const direccion = sesion?.usuario?.direccion
  const {
    data:       balance,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBalance(direccion)

  const balanceMostrar = balance ?? ultimoBalance ?? '0.00'

  function formatBalance(val: string): string {
    const num = parseFloat(val)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }

  function tiempoActualizacion(): string {
    if (!ultimaActualizacion) return ''
    const diff = Math.floor((Date.now() - ultimaActualizacion.getTime()) / 1000)
    if (diff < 60)  return `hace ${diff}s`
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`
    return `hace ${Math.floor(diff / 3600)}h`
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.teal}
            colors={[colors.teal]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="body" color="secondary">
            Bienvenido
          </AppText>
          <AppText variant="heading">
            @{sesion?.usuario?.username ?? '—'}
          </AppText>
        </View>

        {/* Card de balance */}
        <Card variant="teal" style={styles.balanceCard}>
          {isLoading && !balance ? (
            <BalanceSkeleton />
          ) : (
            <View style={styles.balanceContent}>
              <AppText variant="caption" color="secondary">
                SALDO DISPONIBLE
              </AppText>

              <View style={styles.balanceRow}>
                <AppText style={styles.balanceNumero} color="teal">
                  {formatBalance(balanceMostrar)}
                </AppText>
                <AppText variant="body" color="secondary" style={styles.balanceMoneda}>
                  USDT
                </AppText>
              </View>

              <View style={styles.balanceMeta}>
                <View style={[
                  styles.indicador,
                  { backgroundColor: online ? colors.teal : colors.gold }
                ]} />
                <AppText variant="caption" color="secondary">
                  {online
                    ? ultimaActualizacion
                      ? `Actualizado ${tiempoActualizacion()}`
                      : 'Actualizando...'
                    : 'Sin conexión'
                  }
                </AppText>
              </View>
            </View>
          )}
        </Card>

        {/* Acciones principales */}
        <View style={styles.acciones}>
          <Button
            label="Enviar"
            onPress={() => router.push('/(app)/enviar')}
            icon={<ArrowUpRight size={iconSizes.md} color={colors.ink} />}
            style={styles.accionBtn}
          />
          <Button
            label="Recibir"
            onPress={() => router.push('/(app)/recibir')}
            variant="secondary"
            icon={<ArrowDownLeft size={iconSizes.md} color={colors.teal} />}
            style={styles.accionBtn}
          />
        </View>

        {/* Acceso rápido al historial */}
        <Button
          label="Ver historial"
          onPress={() => router.push('/(app)/historial')}
          variant="ghost"
          icon={<Clock size={iconSizes.md} color={colors.textSecondary} />}
        />

        {isError && !balance && (
          <AppText
            variant="caption"
            color="coral"
            center
            style={{ marginTop: spacing[4] }}
          >
            No se pudo obtener el saldo. Desliza hacia abajo para reintentar.
          </AppText>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding:    spacing[5],
    paddingTop: spacing[6],
    gap:        spacing[5],
  },
  header: {
    gap: spacing[1],
  },
  balanceCard: {
    padding: spacing[5],
  },
  balanceContent: {
    alignItems: 'center',
    gap:        spacing[3],
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           spacing[2],
  },
  balanceNumero: {
    fontSize:      56,
    fontWeight:    '800',
    letterSpacing: -2,
    lineHeight:    64,
  },
  balanceMoneda: {
    marginBottom: spacing[2],
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[1],
  },
  indicador: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  acciones: {
    flexDirection: 'row',
    gap:           spacing[3],
  },
  accionBtn: {
    flex: 1,
  },
})