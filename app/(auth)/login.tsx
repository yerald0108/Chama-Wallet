// app/(auth)/login.tsx
import { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native'
import { Screen, AppText, Button, Input, Divider } from '@/components/ui'
import { iniciarSesion } from '@/services/supabase/auth'
import { loginSchema } from '@/utils/validaciones'
import { colors, spacing, iconSizes } from '@/theme/tokens'

export default function Login() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [cargando,   setCargando]   = useState(false)
  const [errores,    setErrores]    = useState<Record<string, string>>({})

  async function handleLogin() {
    const resultado = loginSchema.safeParse({ email, password })

    if (!resultado.success) {
      const errs: Record<string, string> = {}
      resultado.error.issues.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message
      })
      setErrores(errs)
      return
    }

    setErrores({})
    setCargando(true)

    try {
      await iniciarSesion(email.trim(), password)
      router.replace('/(app)/inicio')
    } catch (error: any) {
      Alert.alert('Error al iniciar sesión', error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Screen scroll padded>
      <View style={styles.header}>
        <AppText variant="heading">Bienvenido de vuelta</AppText>
        <AppText variant="body" color="secondary">
          Ingresa a tu billetera Chama
        </AppText>
      </View>

      <View style={styles.form}>
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

        <Input
          label="Contraseña"
          placeholder="Tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          autoCapitalize="none"
          error={errores.password}
          icon={<Lock size={iconSizes.md} color={colors.textTertiary} />}
          iconRight={
            showPass
              ? <EyeOff size={iconSizes.md} color={colors.textTertiary} />
              : <Eye    size={iconSizes.md} color={colors.textTertiary} />
          }
          onIconRightPress={() => setShowPass(!showPass)}
        />
      </View>

      <Button
        label="Iniciar sesión"
        onPress={handleLogin}
        loading={cargando}
      />

      <View style={styles.footer}>
        <Button
          label="¿Olvidaste tu contraseña?"
          onPress={() => router.push('/(auth)/recuperar')}
          variant="ghost"
          fullWidth={false}
        />
        <Button
          label="Crear cuenta nueva"
          onPress={() => router.push('/(auth)/registro')}
          variant="ghost"
          fullWidth={false}
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
  form: {
    gap:          spacing[4],
    marginBottom: spacing[6],
  },
  footer: {
    alignItems: 'center',
    gap:        spacing[1],
    marginTop:  spacing[4],
  },
})