// app/index.tsx
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useSesionStore } from '@/stores/sesionStore'
import { colors } from '@/theme/tokens'

export default function Index() {
  const { sesion, cargando } = useSesionStore()

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    )
  }

  if (sesion) {
    return <Redirect href="/(app)/inicio" />
  }

  return <Redirect href="/(auth)/bienvenida" />
}