// app/(app)/inicio.tsx
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowUpRight, ArrowDownLeft, Clock, TrendingUp } from 'lucide-react-native'
import { router } from 'expo-router'
import { AppText, Card, Button } from '@/components/ui'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { BalanceSkeleton } from '@/components/wallet/BalanceSkeleton'
import { useBalance } from '@/queries/useBalance'
import { useTransacciones } from '@/queries/useTransacciones'
import { useSesionStore } from '@/stores/sesionStore'
import { useOfflineStore } from '@/stores/offlineStore'
import { useConectividad } from '@/hooks/useConectividad'
import { formatearUSDT, formatearFechaRelativa } from '@/utils/formateo'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'
import type { TransaccionConUsuarios } from '@/types/transaccion'

export default function Inicio() {
  const sesion        = useSesionStore(s => s.sesion)
  const ultimoBalance = useOfflineStore(s => s.ultimoBalance)
  const ultimaActualizacion = useOfflineStore(s => s.ultimaActualizacion)
  const online        = useOfflineStore(s => s.online)

  useConectividad()

  const usuario   = sesion?.usuario
  const direccion = usuario?.direccion

  const {
    data:        balance,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBalance(direccion)

  const { data: txs } = useTransacciones(usuario?.id)

  const balanceMostrar  = balance ?? ultimoBalance ?? '0.00'
  const ultimasTres     = ((txs ?? []) as TransaccionConUsuarios[]).slice(0, 3)

  function tiempoActualizacion(): string {
    if (!ultimaActualizacion) return 'Actualizando...'
    const diff = Math.floor((Date.now() - ultimaActualizacion.getTime()) / 1000)
    if (diff < 10)   return 'Ahora mismo'
    if (diff < 60)   return `hace ${diff}s`
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`
    return `hace ${Math.floor(diff / 3600)}h`
  }

  function esEnviada(tx: TransaccionConUsuarios) {
    return tx.remitente_id === usuario?.id
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
          <View>
            <AppText variant="caption" color="secondary">
              BIENVENIDO
            </AppText>
            <AppText variant="heading">
              @{usuario?.username ?? '—'}
            </AppText>
          </View>
          <View style={styles.reputacionBadge}>
            <TrendingUp size={12} color={colors.gold} />
            <AppText variant="caption" style={styles.reputacionTexto}>
              {(usuario?.puntuacion ?? 0) > 0 ? '+' : ''}{usuario?.puntuacion ?? 0}
            </AppText>
          </View>
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
                  {formatearUSDT(balanceMostrar)}
                </AppText>
                <AppText
                  variant="subheading"
                  color="secondary"
                  style={styles.balanceMoneda}
                >
                  USDT
                </AppText>
              </View>

              <View style={styles.balanceMeta}>
                <View style={[
                  styles.indicador,
                  { backgroundColor: online ? colors.teal : colors.gold },
                ]} />
                <AppText variant="caption" color="secondary">
                  {online ? tiempoActualizacion() : 'Sin conexión'}
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

        {/* Últimas transacciones */}
        {ultimasTres.length > 0 && (
          <View style={styles.txSection}>
            <View style={styles.txSectionHeader}>
              <AppText variant="subheading">Recientes</AppText>
              <Button
                label="Ver todo"
                onPress={() => router.push('/(app)/historial')}
                variant="ghost"
                size="sm"
                fullWidth={false}
              />
            </View>

            <Card variant="default" style={styles.txCard}>
              {ultimasTres.map((tx, index) => {
                const enviada     = esEnviada(tx)
                const contraparte = enviada
                  ? tx.destinatario?.username
                  : tx.remitente?.username

                return (
                  <View key={tx.id}>
                    <View style={styles.txItem}>
                      <View style={[
                        styles.txIcono,
                        enviada ? styles.txIconoEnviada : styles.txIconoRecibida,
                      ]}>
                        {enviada
                          ? <ArrowUpRight  size={14} color={colors.coral} />
                          : <ArrowDownLeft size={14} color={colors.teal}  />
                        }
                      </View>

                      <View style={styles.txInfo}>
                        <AppText variant="body" bold>
                          {enviada ? 'A' : 'De'} @{contraparte}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          {formatearFechaRelativa(tx.creado_en)}
                        </AppText>
                      </View>

                      <AppText
                        variant="body"
                        color={enviada ? 'coral' : 'teal'}
                        bold
                      >
                        {enviada ? '-' : '+'}{formatearUSDT(tx.monto)}
                      </AppText>
                    </View>

                    {index < ultimasTres.length - 1 && (
                      <View style={styles.txSeparador} />
                    )}
                  </View>
                )
              })}
            </Card>
          </View>
        )}

        {/* Estado vacío */}
        {ultimasTres.length === 0 && !isLoading && (
          <Card variant="outlined" style={styles.vaciоCard}>
            <Clock size={32} color={colors.textTertiary} strokeWidth={1} />
            <AppText variant="body" color="secondary" center>
              Aún no tienes transacciones. Pide a alguien que te envíe USDT a{' '}
              <AppText variant="body" color="teal" bold>
                @{usuario?.username}
              </AppText>
            </AppText>
          </Card>
        )}

        {isError && !balance && (
          <AppText variant="caption" color="coral" center>
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
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[6],
    paddingBottom:     spacing[10],
    gap:               spacing[5],
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  reputacionBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    backgroundColor:   colors.goldLight,
    paddingVertical:   4,
    paddingHorizontal: spacing[3],
    borderRadius:      radii.full,
    borderWidth:       1,
    borderColor:       colors.gold,
  },
  reputacionTexto: {
    color:      colors.gold,
    fontWeight: '600' as const,
  },
  balanceCard: {
    padding: spacing[6],
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
    fontSize:      60,
    fontWeight:    '800' as const,
    letterSpacing: -2,
    lineHeight:    68,
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
  txSection: {
    gap: spacing[3],
  },
  txSectionHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  txCard: {
    padding: 0,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[3],
    padding:        spacing[4],
  },
  txIcono: {
    width:          32,
    height:         32,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
  },
  txIconoEnviada: {
    backgroundColor: colors.coralLight,
  },
  txIconoRecibida: {
    backgroundColor: colors.tealLight,
  },
  txInfo: {
    flex: 1,
    gap:  2,
  },
  txSeparador: {
    height:          1,
    backgroundColor: colors.borderSubtle,
    marginLeft:      spacing[4] + 32 + spacing[3],
  },
  vaciоCard: {
    alignItems:    'center',
    gap:           spacing[4],
    paddingVertical: spacing[8],
  },
})