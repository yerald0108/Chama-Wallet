// src/services/supabase/transacciones.ts
import { supabase } from './client'
import { hashPin } from '@/services/seguridad/cifrado'

interface EnviarParams {
  destinatario_username: string
  monto:                 number
  pin:                   string
}

interface ResultadoEnvio {
  tx_id:   string
  hash_tx: string
  mensaje: string
}

export async function enviarUSDT(params: EnviarParams): Promise<ResultadoEnvio> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa')

  // Hash del PIN en el cliente — nunca enviamos el PIN en texto plano
  const pin_hash = await hashPin(params.pin)

  const { data, error } = await supabase.functions.invoke('enviar-usdt', {
    body: {
      destinatario_username: params.destinatario_username,
      monto:                 params.monto,
      pin_hash,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.ok) throw new Error(data?.error ?? 'Error al enviar')

  return data
}

export async function obtenerTransacciones(usuarioId: string) {
  const { data, error } = await supabase
    .from('transacciones')
    .select(`
      *,
      remitente:remitente_id(username),
      destinatario:destinatario_id(username)
    `)
    .or(`remitente_id.eq.${usuarioId},destinatario_id.eq.${usuarioId}`)
    .order('creado_en', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data
}