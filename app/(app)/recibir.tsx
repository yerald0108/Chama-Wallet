// app/(app)/recibir.tsx
import { useState } from 'react'
import { View, StyleSheet, Share } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import QRCode from 'react-native-qrcode-svg'
import { Copy, Share2, CheckCheck } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Screen, AppText, Button, Card } from '@/components/ui'
import { useSesionStore } from '@/stores/sesionStore'
import { colors, spacing, iconSizes, radii } from '@/theme/tokens'

export default function Recibir() {
  const sesion    = useSesionStore(s => s.sesion)
  const [copiado, setCopiado] = useState(false)

  const direccion = sesion?.usuario?.direccion ?? ''
  const username  = sesion?.usuario?.username  ?? ''

  async function handleCopiarDireccion() {
    if (!direccion) return
    await Clipboard.setStringAsync(direccion)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function handleCompartir() {
    await Share.share({
      message: `Mi dirección Chama:\n@${username}\n${direccion}`,
      title:   'Mi billetera Chama',
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <AppText variant="heading">Recibir USDT</AppText>
          <AppText variant="body" color="secondary">
            Comparte tu dirección para recibir pagos
          </AppText>
        </View>

        {/* QR Code */}
        <Card variant="default" style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            {direccion ? (
              <QRCode
                value={direccion}
                size={200}
                backgroundColor={colors.ink2}
                color={colors.white}
              />
            ) : (
              <View style={styles.qrPlaceholder} />
            )}
          </View>

          {/* Username */}
          <View style={styles.usernameContainer}>
            <AppText variant="caption" color="secondary" center>
              TU USERNAME
            </AppText>
            <AppText
              variant="heading"
              color="teal"
              center
              style={styles.username}
            >
              @{username}
            </AppText>
          </View>
        </Card>

        {/* Dirección */}
        <Card variant="outlined" style={styles.direccionCard}>
          <AppText variant="caption" color="secondary">
            DIRECCIÓN BSC
          </AppText>
          <AppText
            variant="mono"
            style={styles.direccionTexto}
            numberOfLines={2}
          >
            {direccion || '—'}
          </AppText>
        </Card>

        {/* Acciones */}
        <View style={styles.acciones}>
          <Button
            label={copiado ? 'Copiado' : 'Copiar dirección'}
            onPress={handleCopiarDireccion}
            icon={
              copiado
                ? <CheckCheck size={iconSizes.md} color={colors.ink} />
                : <Copy       size={iconSizes.md} color={colors.ink} />
            }
          />
          <View style={{ height: spacing[3] }} />
          <Button
            label="Compartir"
            onPress={handleCompartir}
            variant="secondary"
            icon={<Share2 size={iconSizes.md} color={colors.teal} />}
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
  qrCard: {
    alignItems: 'center',
    gap:        spacing[5],
    padding:    spacing[6],
  },
  qrWrapper: {
    padding:         spacing[4],
    backgroundColor: colors.ink2,
    borderRadius:    radii.lg,
    borderWidth:     1,
    borderColor:     colors.borderDefault,
  },
  qrPlaceholder: {
    width:           200,
    height:          200,
    backgroundColor: colors.ink3,
    borderRadius:    radii.md,
  },
  usernameContainer: {
    alignItems: 'center',
    gap:        spacing[1],
  },
  username: {
    fontSize: 28,
  },
  direccionCard: {
    gap:     spacing[2],
    padding: spacing[4],
  },
  direccionTexto: {
    color:      colors.textSecondary,
    lineHeight: 20,
  },
  acciones: {
    width: '100%',
  },
})