// src/services/seguridad/cifrado.ts
import * as ExpoCrypto from 'expo-crypto'

// Convertir string a Uint8Array
function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Convertir Uint8Array a hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Convertir hex string a Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, 2), 16)
  }
  return bytes
}

// Generar salt aleatorio usando expo-crypto
export function generarSalt(): string {
  const bytes = ExpoCrypto.getRandomBytes(32)
  return bytesToHex(bytes)
}

// Hash del PIN usando expo-crypto
export async function hashPin(pin: string): Promise<string> {
  return ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    pin,
  )
}

// Cifrar llave privada con PIN
// Usamos XOR + SHA256 como cifrado simple compatible con React Native
// La seguridad viene de la fortaleza del hash derivado
export async function cifrarLlave(
  llavePlana: string,
  pin:        string,
  salt:       string,
): Promise<string> {
  // Derivar clave desde PIN + salt usando SHA256 iterativo (PBKDF2 manual)
  let claveHex = await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    pin + salt,
  )

  // 10000 iteraciones para hacer el hash más costoso
  for (let i = 0; i < 10000; i++) {
    claveHex = await ExpoCrypto.digestStringAsync(
      ExpoCrypto.CryptoDigestAlgorithm.SHA256,
      claveHex + pin + salt,
    )
  }

  // XOR de la llave privada con la clave derivada (expandida)
  const llaveBytes = strToBytes(llavePlana)
  const claveBytes = hexToBytes(claveHex.repeat(
    Math.ceil(llaveBytes.length / 32)
  ).substring(0, llaveBytes.length * 2))

  const cifrado = new Uint8Array(llaveBytes.length)
  for (let i = 0; i < llaveBytes.length; i++) {
    cifrado[i] = llaveBytes[i] ^ claveBytes[i]
  }

  return bytesToHex(cifrado)
}