// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const CHUNK_SIZE = 1800

// Divide valores grandes en chunks para respetar el límite de SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Intentar obtener directamente primero
      const item = await SecureStore.getItemAsync(key)
      if (item) return item

      // Si no existe, intentar reconstruir desde chunks
      const countStr = await SecureStore.getItemAsync(key + '_count')
      if (!countStr) return null

      const count = parseInt(countStr)
      let valor = ''
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(key + '_chunk_' + i)
        if (!chunk) return null
        valor += chunk
      }
      return valor
    } catch {
      return null
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value)
        return
      }

      // Dividir en chunks
      const chunks: string[] = []
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE))
      }

      await SecureStore.setItemAsync(key + '_count', String(chunks.length))
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(key + '_chunk_' + i, chunks[i])
      }
    } catch (error) {
      console.log('SecureStore setItem error:', error)
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key)

      const countStr = await SecureStore.getItemAsync(key + '_count')
      if (countStr) {
        const count = parseInt(countStr)
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(key + '_chunk_' + i)
        }
        await SecureStore.deleteItemAsync(key + '_count')
      }
    } catch {
      // ignorar errores al eliminar
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage:            ExpoSecureStoreAdapter,
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: false,
  },
})