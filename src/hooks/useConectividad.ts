// src/hooks/useConectividad.ts
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useOfflineStore } from '@/stores/offlineStore'

export function useConectividad() {
  const setOnline = useOfflineStore(s => s.setOnline)

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setOnline(
        state.isConnected === true && state.isInternetReachable === true
      )
    })
    return unsub
  }, [])
}