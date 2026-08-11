// src/stores/uiStore.ts
import { create } from 'zustand'

type ToastTipo = 'exito' | 'error' | 'advertencia'

interface Toast {
  tipo:    ToastTipo
  mensaje: string
}

interface UIState {
  toast:         Toast | null
  mostrarToast:  (toast: Toast) => void
  ocultarToast:  () => void
}

export const useUIStore = create<UIState>((set) => ({
  toast:        null,
  mostrarToast: (toast: Toast) => {
    set({ toast })
    setTimeout(() => set({ toast: null }), 3500)
  },
  ocultarToast: () => set({ toast: null }),
}))