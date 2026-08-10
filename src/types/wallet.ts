// src/types/wallet.ts
export interface WalletInfo {
  direccion:    string
  llaveCifrada: string
  salt:         string
}

export interface WalletEnMemoria {
  direccion: string
  // La llave privada NUNCA se guarda aquí
  // Solo existe en la Edge Function durante la firma
}