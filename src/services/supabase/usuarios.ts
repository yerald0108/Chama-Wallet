// src/services/supabase/usuarios.ts
import { supabase } from './client'
import type { WalletInfo } from '@/types/wallet'

export async function guardarWallet(
  authId:     string,
  walletInfo: WalletInfo,
  pinHash:    string,
): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update({
      direccion:     walletInfo.direccion,
      llave_cifrada: walletInfo.llaveCifrada,
      salt:          walletInfo.salt,
      pin_hash:      pinHash,
    })
    .eq('auth_id', authId)

  if (error) throw new Error(error.message)
}

export async function buscarPorUsername(username: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, nombre, direccion, puntuacion')
    .eq('username', username.toLowerCase().trim())
    .single()

  if (error) return null
  return data
}


export async function buscarUsuariosPorUsername(query: string) {
  const { data } = await supabase
    .from('usuarios')
    .select('id, username, nombre, puntuacion')
    .ilike('username', `%${query}%`)
    .limit(5)

  return data ?? []
}