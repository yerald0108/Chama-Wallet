// src/stores/sesionStore.ts
import { create } from 'zustand'
import type { SesionUsuario } from '@/types/usuario'

interface SesionState {
  sesion:       SesionUsuario | null
  cargando:     boolean
  setSesion:    (sesion: SesionUsuario | null) => void
  setCargando:  (cargando: boolean) => void
  cerrarSesion: () => void
}

export const useSesionStore = create<SesionState>((set) => ({
  sesion:       null,
  cargando:     true,
  setSesion:    (sesion) => set({ sesion }),
  setCargando:  (cargando) => set({ cargando }),
  cerrarSesion: () => set({ sesion: null }),
}))