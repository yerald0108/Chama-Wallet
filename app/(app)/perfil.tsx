// app/(app)/perfil.tsx
import { View } from 'react-native'
import { router } from 'expo-router'
import { Screen, AppText, Button } from '@/components/ui'
import { cerrarSesion } from '@/services/supabase/auth'
import { useSesionStore } from '@/stores/sesionStore'

export default function Perfil() {
  const cerrarSesionStore = useSesionStore(s => s.cerrarSesion)

  async function handleCerrarSesion() {
    await cerrarSesion()
    cerrarSesionStore()
    router.replace('/(auth)/bienvenida')
  }

  return (
    <Screen padded>
      <AppText variant="heading">Perfil</AppText>
      <View style={{ marginTop: 32 }}>
        <Button
          label="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
        />
      </View>
    </Screen>
  )
}