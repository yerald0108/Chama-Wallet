// app/(auth)/bienvenida.tsx
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Wallet } from 'lucide-react-native'
import { Screen, AppText, Button, Divider } from '@/components/ui'
import { colors, spacing, iconSizes } from '@/theme/tokens'

export default function Bienvenida() {
  return (
    <Screen centered padded>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Wallet size={iconSizes['2xl']} color={colors.teal} strokeWidth={1.5} />
        </View>
        <AppText variant="display" center>Chama</AppText>
        <AppText variant="body" color="secondary" center style={styles.tagline}>
          Tu billetera USDT. Simple, segura, para Cuba.
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label="Crear cuenta"
          onPress={() => router.push('/(auth)/registro')}
        />
        <View style={{ height: spacing[3] }} />
        <Button
          label="Ya tengo cuenta"
          onPress={() => router.push('/(auth)/login')}
          variant="secondary"
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing[4],
  },
  logoContainer: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: colors.tealLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing[2],
  },
  tagline: {
    maxWidth: 260,
  },
  actions: {
    width:         '100%',
    paddingBottom: spacing[6],
  },
})