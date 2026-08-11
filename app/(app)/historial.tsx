// app/(app)/historial.tsx
import { useState } from 'react'
import {
  View, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Modal, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, ExternalLink,
} from 'lucide-react-native'
import { AppText, Card, Badge, Button } from '@/components/ui'
import { useTransacciones } from '@/queries/useTransacciones'
import { useSesionStore } from '@/stores/sesionStore'
import { formatearFechaRelativa, formatearUSDT, acortarDireccion } from '@/utils/formateo'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'
import type { TransaccionConUsuarios } from '@/types/transaccion'
import { ModalReputacion } from '@/components/transacciones/ModalReputacion'
import { yaCalifique } from '@/services/supabase/reputacion'
import { BSC } from '@/utils/constantes'

type Filtro = 'todas' | 'enviadas' | 'recibidas'

export default function Historial() {
  const sesion  = useSesionStore(s => s.sesion)
  const usuarioId = sesion?.usuario?.id

  const { data: txs, isLoading, refetch, isRefetching } = useTransacciones(usuarioId)

  const [filtro,    setFiltro]    = useState<Filtro>('todas')
  const [txDetalle, setTxDetalle] = useState<TransaccionConUsuarios | null>(null)

  const txsFiltradas = (txs as TransaccionConUsuarios[] ?? []).filter(tx => {
    if (filtro === 'enviadas')  return tx.remitente_id    === usuarioId
    if (filtro === 'recibidas') return tx.destinatario_id === usuarioId
    return true
  })

  const [modalRep, setModalRep] = useState<{
    visible:       boolean
    txId:          string
    evaluadoId:    string
    evaluadoUsername: string
  } | null>(null)

  async function handleAbrirReputacion(tx: TransaccionConUsuarios) {
    if (tx.estado !== 'confirmada') return

    const evaluadoId = esEnviada(tx) ? tx.destinatario_id : tx.remitente_id
    const evaluadoUsername = esEnviada(tx)
      ? tx.destinatario?.username
      : tx.remitente?.username

    // Siempre abrir el modal — el componente maneja si ya fue calificado
    setModalRep({
      visible:          true,
      txId:             tx.id,
      evaluadoId,
      evaluadoUsername,
    })
  }

  function esEnviada(tx: TransaccionConUsuarios) {
    return tx.remitente_id === usuarioId
  }

  function renderEstado(tx: TransaccionConUsuarios) {
    switch (tx.estado) {
      case 'confirmada': return <Badge label="Confirmada" status="success" />
      case 'pendiente':  return <Badge label="Pendiente"  status="pending" />
      case 'fallida':    return <Badge label="Fallida"    status="error"   />
    }
  }

  function renderTx({ item }: { item: TransaccionConUsuarios }) {
    const enviada    = esEnviada(item)
    const contraparte = enviada
      ? item.destinatario?.username
      : item.remitente?.username

    return (
      <Pressable
        onPress={() => setTxDetalle(item)}
        style={({ pressed }) => [
          styles.txItem,
          pressed && styles.txItemPresionado,
        ]}
      >
        {/* Icono */}
        <View style={[
          styles.txIcono,
          enviada ? styles.txIconoEnviada : styles.txIconoRecibida,
        ]}>
          {enviada
            ? <ArrowUpRight   size={iconSizes.md} color={colors.coral} />
            : <ArrowDownLeft  size={iconSizes.md} color={colors.teal}  />
          }
        </View>

        {/* Info */}
        <View style={styles.txInfo}>
          <AppText variant="subheading">
            {enviada ? 'Enviado a' : 'Recibido de'} @{contraparte}
          </AppText>
          <AppText variant="caption" color="secondary">
            {formatearFechaRelativa(item.creado_en)}
          </AppText>
        </View>

        {/* Monto y estado */}
        <View style={styles.txDerecha}>
          <AppText
            variant="subheading"
            color={enviada ? 'coral' : 'teal'}
          >
            {enviada ? '-' : '+'}{formatearUSDT(item.monto)} USDT
          </AppText>
          {renderEstado(item)}
        </View>
      </Pressable>
    )
  }

  function renderVacio() {
    return (
      <View style={styles.vacio}>
        <Clock size={48} color={colors.textTertiary} strokeWidth={1} />
        <AppText variant="subheading" center>
          Sin transacciones
        </AppText>
        <AppText variant="body" color="secondary" center>
          Aquí aparecerán tus envíos y recepciones de USDT
        </AppText>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="heading">Historial</AppText>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {(['todas', 'enviadas', 'recibidas'] as Filtro[]).map(f => (
          <Pressable
            key={f}
            onPress={() => setFiltro(f)}
            style={[
              styles.filtroBtn,
              filtro === f && styles.filtroBtnActivo,
            ]}
          >
            <AppText
              variant="caption"
              color={filtro === f ? 'teal' : 'secondary'}
              style={filtro === f && styles.filtroTextoActivo}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      ) : (
        <FlatList
          data={txsFiltradas}
          keyExtractor={item => item.id}
          renderItem={renderTx}
          ListEmptyComponent={renderVacio}
          contentContainerStyle={styles.lista}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={styles.separador} />
          )}
        />
      )}

      {/* Modal de detalle */}
      <Modal
        visible={Boolean(txDetalle)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTxDetalle(null)}
      >
        {txDetalle && (
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>

              <View style={styles.modalHeader}>
                <AppText variant="heading">Detalle</AppText>
                <Pressable
                  onPress={() => setTxDetalle(null)}
                  style={styles.modalCerrar}
                  hitSlop={8}
                >
                  <AppText variant="body" color="teal">Cerrar</AppText>
                </Pressable>
              </View>

              {/* Estado grande */}
              <View style={styles.modalEstado}>
                {txDetalle.estado === 'confirmada'
                  ? <CheckCircle size={56} color={colors.teal}  strokeWidth={1.5} />
                  : txDetalle.estado === 'fallida'
                  ? <XCircle     size={56} color={colors.coral} strokeWidth={1.5} />
                  : <Clock       size={56} color={colors.gold}  strokeWidth={1.5} />
                }
                <AppText variant="display" color={
                  txDetalle.estado === 'confirmada' ? 'teal'
                  : txDetalle.estado === 'fallida'  ? 'coral'
                  : 'gold'
                }>
                  {formatearUSDT(txDetalle.monto)} USDT
                </AppText>
                {renderEstado(txDetalle)}
              </View>

              {/* Detalles */}
              <Card variant="default" style={styles.modalDetalles}>
                <View style={styles.modalFila}>
                  <AppText variant="caption" color="secondary">De</AppText>
                  <AppText variant="caption" bold>
                    @{txDetalle.remitente?.username}
                  </AppText>
                </View>
                <View style={styles.modalFila}>
                  <AppText variant="caption" color="secondary">Para</AppText>
                  <AppText variant="caption" bold>
                    @{txDetalle.destinatario?.username}
                  </AppText>
                </View>
                <View style={styles.modalFila}>
                  <AppText variant="caption" color="secondary">Fecha</AppText>
                  <AppText variant="caption">
                    {new Date(txDetalle.creado_en).toLocaleString('es-ES')}
                  </AppText>
                </View>
                {txDetalle.hash_tx && (
                  <View style={styles.modalFila}>
                    <AppText variant="caption" color="secondary">Hash</AppText>
                    <AppText variant="mono" style={styles.hashTexto}>
                      {acortarDireccion(txDetalle.hash_tx)}
                    </AppText>
                  </View>
                )}
                {txDetalle.error_msg && (
                  <View style={styles.modalFila}>
                    <AppText variant="caption" color="secondary">Error</AppText>
                    <AppText variant="caption" color="coral">
                      {txDetalle.error_msg}
                    </AppText>
                  </View>
                )}
              </Card>
              {txDetalle?.estado === 'confirmada' && (
                <Button
                  label="Calificar esta transacción"
                  onPress={() => {
                    setTxDetalle(null)
                    handleAbrirReputacion(txDetalle)
                  }}
                  variant="secondary"
                />
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
        {modalRep && (
          <ModalReputacion
            visible={modalRep.visible}
            onCerrar={() => setModalRep(null)}
            evaluadorId={usuarioId!}
            evaluadoId={modalRep.evaluadoId}
            evaluadoUsername={modalRep.evaluadoUsername}
            transaccionId={modalRep.txId}
          />
        )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[6],
    paddingBottom:     spacing[4],
  },
  filtros: {
    flexDirection:     'row',
    paddingHorizontal: spacing[5],
    gap:               spacing[2],
    marginBottom:      spacing[4],
  },
  filtroBtn: {
    paddingVertical:   spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius:      radii.full,
    borderWidth:       1,
    borderColor:       colors.borderDefault,
  },
  filtroBtnActivo: {
    borderColor:     colors.teal,
    backgroundColor: colors.tealLight,
  },
  filtroTextoActivo: {
    fontWeight: '600' as const,
  },
  lista: {
    paddingHorizontal: spacing[5],
    paddingBottom:     spacing[10],
    flexGrow:          1,
  },
  txItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing[3],
    paddingVertical: spacing[3],
  },
  txItemPresionado: {
    opacity: 0.7,
  },
  txIcono: {
    width:          44,
    height:         44,
    borderRadius:   22,
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
  txDerecha: {
    alignItems: 'flex-end',
    gap:        spacing[1],
  },
  separador: {
    height:          1,
    backgroundColor: colors.borderSubtle,
  },
  vacio: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[4],
    paddingTop:     spacing[16],
  },
  cargando: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex:            1,
    backgroundColor: colors.ink,
  },
  modalContent: {
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
    gap:               spacing[6],
  },
  modalHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  modalCerrar: {
    padding: spacing[2],
  },
  modalEstado: {
    alignItems: 'center',
    gap:        spacing[3],
    paddingVertical: spacing[6],
  },
  modalDetalles: {
    gap: spacing[4],
  },
  modalFila: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  hashTexto: {
    color: colors.textSecondary,
  },
})