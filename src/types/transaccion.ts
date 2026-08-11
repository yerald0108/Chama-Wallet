// src/types/transaccion.ts
export type EstadoTx = 'pendiente' | 'confirmada' | 'fallida'

export interface Transaccion {
  id:             string
  remitente_id:   string
  destinatario_id: string
  monto:          number
  estado:         EstadoTx
  hash_tx:        string | null
  error_msg:      string | null
  creado_en:      string
  confirmado_en:  string | null
}

export interface TransaccionConUsuarios extends Transaccion {
  remitente:    { username: string }
  destinatario: { username: string }
}