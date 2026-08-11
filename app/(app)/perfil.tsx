// app/(app)/perfil.tsx
import { useState } from 'react'
import { View, StyleSheet, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  User, Star, ArrowUpRight, ArrowDownLeft,
  Shield, MessageCircle, LogOut, ChevronRight,
  Lock,
} from 'lucide-react-native'
import { AppText, Button, Card, Divider, PinPad } from '@/components/ui'
import { cerrarSesion } from '@/services/supabase/auth'
import { useSesionStore } from '@/stores/sesionStore'
import { useTransacciones } from '@/queries/useTransacciones'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'

type Vista = 'perfil' | 'cambiar_pin'

export default function Perfil() {
  const sesion             = useSesionStore(s => s.sesion)
  const cerrarSesionStore  = useSesionStore(s => s.cerrarSesion)
  const usuario            = sesion?.usuario

  const [vista,        setVista]        = useState<Vista>('perfil')
  const [pinActual,    setPinActual]    = useState('')
  const [pinNuevo,     setPinNuevo]     = useState('')
  const [pinConfirmar, setPinConfirmar] = useState('  ')
  const [pasoPin,      setPasoPin]      = useState<'actual' | 'nuevo' | 'confirmar'>('actual')
  const [errorPin,     setErrorPin]     = useState('')

  const { data: txs } = useTransacciones(usuario?.id)

  const txsArray    = (txs ?? []) as Array<{ remitente_id: string, destinatario_id: string }>
  const totalEnviadas  = txsArray.filter(t => t.remitente_id    === usuario?.id).length
  const totalRecibidas = txsArray.filter(t => t.destinatario_id === usuario?.id).length

  const limiteUsado      = 0  // Por ahora — se calculará en subfase futura
  const limiteDisponible = usuario?.limite_diario ?? 100
  const porcentajeUsado  = (limiteUsado / limiteDisponible) * 100

  async function handleCerrarSesion() {
    await cerrarSesion()
    cerrarSesionStore()
    router.replace('/(auth)/bienvenida')
  }

  function handleAbrirTelegram() {
    Linking.openURL('https://t.me/chamasoporte')
  }

  // Vista de cambiar PIN
  if (vista === 'cambiar_pin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pinContent}>
          <View style={styles.pinHeader}>
            <AppText variant="heading">
              {pasoPin === 'actual'    ? 'PIN actual'    :
               pasoPin === 'nuevo'     ? 'PIN nuevo'     :
               'Confirmar PIN nuevo'}
            </AppText>
            <AppText variant="body" color="secondary">
              {pasoPin === 'actual'    ? 'Ingresa tu PIN actual para continuar' :
               pasoPin === 'nuevo'     ? 'Elige un PIN de 4 dígitos'           :
               'Repite el PIN nuevo'}
            </AppText>
          </View>

          {errorPin ? (
            <AppText variant="caption" color="coral" center>
              {errorPin}
            </AppText>
          ) : null}

          <PinPad
            value={
              pasoPin === 'actual'    ? pinActual    :
              pasoPin === 'nuevo'     ? pinNuevo     :
              pinConfirmar
            }
            onChange={(val) => {
              setErrorPin('')
              if (pasoPin === 'actual') {
                setPinActual(val)
                if (val.length === 4) setPasoPin('nuevo')
              } else if (pasoPin === 'nuevo') {
                setPinNuevo(val)
                if (val.length === 4) setPasoPin('confirmar')
              } else {
                setPinConfirmar(val)
                if (val.length === 4) {
                  if (val !== pinNuevo) {
                    setErrorPin('Los PINs no coinciden')
                    setPinConfirmar('')
                  } else {
                    // TODO Subfase futura: re-cifrar llave con nuevo PIN
                    setVista('perfil')
                    setPasoPin('actual')
                    setPinActual('')
                    setPinNuevo('')
                    setPinConfirmar('')
                  }
                }
              }
            }}
          />

          <Button
            label="Cancelar"
            onPress={() => {
              setVista('perfil')
              setPasoPin('actual')
              setPinActual('')
              setPinNuevo('')
              setPinConfirmar('')
              setErrorPin('')
            }}
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    )
  }

  // Vista principal de perfil
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Avatar y nombre */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={iconSizes.xl} color={colors.teal} />
          </View>
          <AppText variant="heading">
            @{usuario?.username}
          </AppText>
          {usuario?.nombre && (
            <AppText variant="body" color="secondary">
              {usuario.nombre}
            </AppText>
          )}

          {/* Reputación */}
          <View style={styles.reputacionBadge}>
            <Star size={14} color={colors.gold} />
            <AppText variant="caption" style={styles.reputacionTexto}>
              {(usuario?.puntuacion ?? 0) > 0 ? '+' : ''}{usuario?.puntuacion ?? 0} reputación
            </AppText>
          </View>
        </View>

        {/* Estadísticas */}
        <Card variant="default" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIcono}>
                <ArrowUpRight size={iconSizes.sm} color={colors.coral} />
              </View>
              <AppText variant="display" style={styles.statNumero}>
                {totalEnviadas}
              </AppText>
              <AppText variant="caption" color="secondary" center>
                Enviadas
              </AppText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcono, styles.statIconoVerde]}>
                <ArrowDownLeft size={iconSizes.sm} color={colors.teal} />
              </View>
              <AppText variant="display" style={styles.statNumero}>
                {totalRecibidas}
              </AppText>
              <AppText variant="caption" color="secondary" center>
                Recibidas
              </AppText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcono, styles.statIconoGold]}>
                <Star size={iconSizes.sm} color={colors.gold} />
              </View>
              <AppText variant="display" style={styles.statNumero}>
                {totalEnviadas + totalRecibidas}
              </AppText>
              <AppText variant="caption" color="secondary" center>
                Total
              </AppText>
            </View>
          </View>
        </Card>

        {/* Límite diario */}
        <Card variant="default">
          <View style={styles.limitHeader}>
            <AppText variant="caption" color="secondary">
              LÍMITE DIARIO
            </AppText>
            <AppText variant="caption" bold>
              {limiteUsado.toFixed(0)} / {limiteDisponible.toFixed(0)} USDT
            </AppText>
          </View>
          <View style={styles.limitBar}>
            <View
              style={[
                styles.limitBarFill,
                { width: `${Math.min(porcentajeUsado, 100)}%` },
                porcentajeUsado > 80 && styles.limitBarWarning,
              ]}
            />
          </View>
          <AppText variant="caption" color="secondary">
            Disponible hoy: {(limiteDisponible - limiteUsado).toFixed(2)} USDT
          </AppText>
        </Card>

        {/* Acciones */}
        <Card variant="default" style={styles.accionesCard}>
          <AppText variant="caption" color="secondary" style={styles.accionesLabel}>
            CUENTA
          </AppText>

          <View style={styles.accionItem}>
            <View style={styles.accionIzquierda}>
              <Lock size={iconSizes.md} color={colors.textSecondary} />
              <AppText variant="body">Cambiar PIN</AppText>
            </View>
            <Button
              label="Cambiar"
              onPress={() => setVista('cambiar_pin')}
              variant="ghost"
              size="sm"
              fullWidth={false}
            />
          </View>

          <Divider marginV={spacing[1]} />

          <View style={styles.accionItem}>
            <View style={styles.accionIzquierda}>
              <MessageCircle size={iconSizes.md} color={colors.textSecondary} />
              <AppText variant="body">Soporte en Telegram</AppText>
            </View>
            <Button
              label="Abrir"
              onPress={handleAbrirTelegram}
              variant="ghost"
              size="sm"
              fullWidth={false}
            />
          </View>

          <Divider marginV={spacing[1]} />

          <View style={styles.accionItem}>
            <View style={styles.accionIzquierda}>
              <Shield size={iconSizes.md} color={colors.textSecondary} />
              <AppText variant="body">Versión</AppText>
            </View>
            <AppText variant="caption" color="secondary">1.0.0</AppText>
          </View>
        </Card>

        {/* Cerrar sesión */}
        <Button
          label="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
        />

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
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
    gap:               spacing[4],
  },
  avatarSection: {
    alignItems:    'center',
    gap:           spacing[2],
    paddingVertical: spacing[4],
  },
  avatar: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing[2],
  },
  reputacionBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing[1],
    backgroundColor:   colors.goldLight,
    paddingVertical:   spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius:      radii.full,
    borderWidth:       1,
    borderColor:       colors.gold,
  },
  reputacionTexto: {
    color:      colors.gold,
    fontWeight: '600' as const,
  },
  statsCard: {
    padding: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  statItem: {
    flex:           1,
    alignItems:     'center',
    gap:            spacing[2],
  },
  statIcono: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: colors.coralLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  statIconoVerde: {
    backgroundColor: colors.tealLight,
  },
  statIconoGold: {
    backgroundColor: colors.goldLight,
  },
  statNumero: {
    fontSize:   28,
    lineHeight: 32,
  },
  statDivider: {
    width:           1,
    height:          60,
    backgroundColor: colors.borderSubtle,
  },
  limitHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   spacing[3],
  },
  limitBar: {
    height:          6,
    backgroundColor: colors.ink3,
    borderRadius:    radii.full,
    marginBottom:    spacing[2],
    overflow:        'hidden',
  },
  limitBarFill: {
    height:          '100%',
    backgroundColor: colors.teal,
    borderRadius:    radii.full,
  },
  limitBarWarning: {
    backgroundColor: colors.gold,
  },
  accionesCard: {
    gap: spacing[3],
  },
  accionesLabel: {
    marginBottom: spacing[1],
  },
  accionItem: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  accionIzquierda: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[3],
  },
  pinContent: {
    flex:              1,
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
    gap:               spacing[8],
  },
  pinHeader: {
    gap: spacing[2],
  },
})