// src/stores/offlineStore.ts
import { create } from 'zustand'

interface OfflineState {
  online:         boolean
  ultimoBalance:  string
  ultimaActualizacion: Date | null
  setOnline:      (online: boolean) => void
  setUltimoBalance: (balance: string) => void
}

export const useOfflineStore = create<OfflineState>((set) => ({
  online:              true,
  ultimoBalance:       '0.00',
  ultimaActualizacion: null,
  setOnline:           (online) => set({ online }),
  setUltimoBalance:    (balance) => set({
    ultimoBalance:       balance,
    ultimaActualizacion: new Date(),
  }),
}))