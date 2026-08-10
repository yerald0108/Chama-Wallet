// src/services/seguridad/pin.ts
import * as SecureStore from 'expo-secure-store'

const PIN_HASH_KEY = 'chama_pin_hash'

export async function guardarPinHash(pinHash: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_HASH_KEY, pinHash)
}

export async function obtenerPinHash(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_HASH_KEY)
}

export async function verificarPin(pin: string, hashPin: (p: string) => Promise<string>): Promise<boolean> {
  const hashGuardado = await obtenerPinHash()
  if (!hashGuardado) return false
  const hashIngresado = await hashPin(pin)
  return hashGuardado === hashIngresado
}

export async function eliminarPinHash(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY)
}