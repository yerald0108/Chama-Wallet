// app/_layout.tsx
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Providers } from '@/components/shared/Providers'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Stack screenOptions={{ headerShown: false }} />
      </Providers>
    </GestureHandlerRootView>
  )
}