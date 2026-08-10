// app/(auth)/recuperar.tsx
import { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { Mail } from 'lucide-react-native'
import { Screen, AppText, Button, Input } from '@/components/ui'
import { recuperarContrasena } from '@/services/supabase/auth'
import { recuperarSchema } from '@/utils/validaciones'
import { colors, spacing, iconSizes } from '@/theme/tokens'

export default function Recuperar() {
  const [email,    setEmail]    = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)
  const [errores,  setErrores]  = useState<Record<string, string>>({})

  async function handleRecuperar() {
    const resultado = recuperarSchema.safeParse({ email })

    if (!resultado.success) {
      setErrores({ email: resultado.error.issues[0]?.message ?? 'Email inválido' })
      return
    }

    setErrores({})
    setCargando(true)

    try {
      await recuperarContrasena(email.trim())
      setEnviado(true)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <Screen centered padded>
        <AppText variant="heading" center>Revisa tu email</AppText>
        <AppText variant="body" color="secondary" center style={{ marginTop: spacing[3] }}>
          Te enviamos un enlace para restablecer tu contraseña a {email}
        </AppText>
        <View style={{ marginTop: spacing[8], width: '100%' }}>
          <Button
            label="Volver al inicio"
            onPress={() => router.replace('/(auth)/bienvenida')}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen padded>
      <View style={styles.header}>
        <AppText variant="heading">Recuperar contraseña</AppText>
        <AppText variant="body" color="secondary">
          Te enviamos un enlace a tu email para crear una nueva contraseña
        </AppText>
      </View>

      <Input
        label="Email"
        placeholder="tu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errores.email}
        icon={<Mail size={iconSizes.md} color={colors.textTertiary} />}
      />

      <View style={{ marginTop: spacing[6] }}>
        <Button
          label="Enviar enlace"
          onPress={handleRecuperar}
          loading={cargando}
        />
        <View style={{ height: spacing[3] }} />
        <Button
          label="Volver"
          onPress={() => router.back()}
          variant="ghost"
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    gap:          spacing[2],
    marginBottom: spacing[8],
  },
})