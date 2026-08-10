// app/(auth)/registro.tsx
import { useState, useCallback } from 'react'
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Mail, Lock, User, AtSign, Eye, EyeOff, Check, X } from 'lucide-react-native'
import { Screen, AppText, Button, Input } from '@/components/ui'
import { registrarUsuario, verificarUsername } from '@/services/supabase/auth'
import { generarWallet } from '@/services/blockchain/wallet'
import { guardarWallet } from '@/services/supabase/usuarios'
import { obtenerPerfil } from '@/services/supabase/auth'
import { useSesionStore } from '@/stores/sesionStore'
import { hashPin } from '@/services/seguridad/cifrado'
import { registroSchema } from '@/utils/validaciones'
import { colors, spacing, iconSizes } from '@/theme/tokens'

type UsernameEstado = 'idle' | 'verificando' | 'disponible' | 'ocupado'
type PasoRegistro  = 'formulario' | 'generando' | 'guardando'

export default function Registro() {
  const [username,   setUsername]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [pin,        setPin]        = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [cargando,   setCargando]   = useState(false)
  const [paso,       setPaso]       = useState<PasoRegistro>('formulario')
  const [errores,    setErrores]    = useState<Record<string, string>>({})
  const [usernameEstado, setUsernameEstado] = useState<UsernameEstado>('idle')
  const setSesion = useSesionStore(s => s.setSesion)

  const handleUsernameChange = useCallback((valor: string) => {
    const limpio = valor.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(limpio)

    if (limpio.length < 3) {
      setUsernameEstado('idle')
      return
    }

    setUsernameEstado('verificando')

    const timer = setTimeout(async () => {
      try {
        const disponible = await verificarUsername(limpio)
        setUsernameEstado(disponible ? 'disponible' : 'ocupado')
      } catch {
        setUsernameEstado('idle')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  function iconUsername() {
    switch (usernameEstado) {
      case 'verificando': return <AtSign size={iconSizes.md} color={colors.textTertiary} />
      case 'disponible':  return <Check  size={iconSizes.md} color={colors.teal} />
      case 'ocupado':     return <X      size={iconSizes.md} color={colors.coral} />
      default:            return <AtSign size={iconSizes.md} color={colors.textTertiary} />
    }
  }

  async function handleRegistro() {
    const resultado = registroSchema.safeParse({
      username, email, password, pin, pinConfirm,
    })

    if (!resultado.success) {
      const errs: Record<string, string> = {}
      resultado.error.issues.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message
      })
      setErrores(errs)
      return
    }

    if (usernameEstado === 'ocupado') {
      setErrores({ username: 'Este username ya está en uso' })
      return
    }

    if (usernameEstado !== 'disponible') {
      setErrores({ username: 'Verifica la disponibilidad del username' })
      return
    }

    setErrores({})
    setCargando(true)

    try {
      // Paso 1: Crear cuenta en Supabase Auth
      const user = await registrarUsuario(email.trim(), password, username)

      // Paso 2: Generar wallet localmente
      setPaso('generando')
      const walletInfo = await generarWallet(pin)

      // Paso 3: Guardar wallet cifrada en Supabase
      setPaso('guardando')
      const pinHash = await hashPin(pin)
      await guardarWallet(user.id, walletInfo, pinHash)

      // Paso 4: Cargar perfil completo y guardar en sesionStore
      const perfil = await obtenerPerfil(user.id)
      setSesion({
        id:      user.id,
        email:   email.trim(),
        usuario: perfil,
      })

      router.replace('/(app)/inicio')

    } catch (error: any) {
      Alert.alert('Error al registrarse', error.message)
      setPaso('formulario')
    } finally {
      setCargando(false)
    }
  }

  // Pantalla de progreso durante generación
  if (paso === 'generando' || paso === 'guardando') {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.teal} />
        <AppText
          variant="body"
          color="secondary"
          center
          style={{ marginTop: spacing[4] }}
        >
          {paso === 'generando'
            ? 'Creando tu billetera...'
            : 'Guardando de forma segura...'
          }
        </AppText>
      </Screen>
    )
  }

  return (
    <Screen scroll padded>
      <View style={styles.header}>
        <AppText variant="heading">Crear cuenta</AppText>
        <AppText variant="body" color="secondary">
          Tu billetera estará lista en segundos
        </AppText>
      </View>

      <View style={styles.form}>
        <Input
          label="Username"
          placeholder="tu_username"
          value={username}
          onChangeText={handleUsernameChange}
          autoCapitalize="none"
          autoComplete="off"
          maxLength={20}
          error={errores.username}
          hint={usernameEstado === 'disponible' ? 'Username disponible' : undefined}
          icon={<User   size={iconSizes.md} color={colors.textTertiary} />}
          iconRight={iconUsername()}
        />

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
          placeholder="Mínimo 8 caracteres"
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

        <Input
          label="PIN de seguridad (4 dígitos)"
          placeholder="••••"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          error={errores.pin}
          icon={<Lock size={iconSizes.md} color={colors.textTertiary} />}
        />

        <Input
          label="Confirmar PIN"
          placeholder="••••"
          value={pinConfirm}
          onChangeText={setPinConfirm}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          error={errores.pinConfirm}
          icon={<Lock size={iconSizes.md} color={colors.textTertiary} />}
        />
      </View>

      <Button
        label="Crear mi billetera"
        onPress={handleRegistro}
        loading={cargando && paso === 'formulario'}
        disabled={usernameEstado === 'ocupado'}
      />

      <View style={styles.footer}>
        <Button
          label="Ya tengo cuenta"
          onPress={() => router.back()}
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
    marginTop:  spacing[4],
  },
})