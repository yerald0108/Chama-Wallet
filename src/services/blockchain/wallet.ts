// src/services/blockchain/wallet.ts
import * as ExpoCrypto from 'expo-crypto'
import { privateKeyToAccount } from 'viem/accounts'
import { generarSalt, cifrarLlave, hashPin } from '@/services/seguridad/cifrado'
import { guardarPinHash } from '@/services/seguridad/pin'
import type { WalletInfo } from '@/types/wallet'

export async function generarWallet(pin: string): Promise<WalletInfo> {
  // 1. Generar 32 bytes aleatorios seguros con expo-crypto
  const entropyBytes = ExpoCrypto.getRandomBytes(32)
  const llavePrivada = ('0x' + Array.from(entropyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')) as `0x${string}`

  // 2. Derivar dirección pública desde llave privada (criptográficamente correcta)
  const account  = privateKeyToAccount(llavePrivada)
  const direccion = account.address

  // 3. Generar salt único
  const salt = generarSalt()

  // 4. Cifrar llave privada con PIN
  const llaveCifrada = await cifrarLlave(llavePrivada, pin, salt)

  // 5. Guardar hash del PIN en SecureStore
  const pinHashValue = await hashPin(pin)
  await guardarPinHash(pinHashValue)

  return {
    direccion,
    llaveCifrada,
    salt,
  }
}