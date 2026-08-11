// src/services/supabase/reputacion.ts
import { supabase } from './client'

export async function calificarUsuario(
  evaluadorId:   string,
  evaluadoId:    string,
  transaccionId: string,
  valor:         1 | -1,
): Promise<void> {
  // Insertar calificación
  const { error: repError } = await supabase
    .from('reputacion')
    .insert({
      evaluador_id:   evaluadorId,
      evaluado_id:    evaluadoId,
      transaccion_id: transaccionId,
      valor,
    })

  if (repError) throw new Error(repError.message)

  // Actualizar puntuación acumulada del evaluado
  const { error: updateError } = await supabase.rpc('actualizar_puntuacion', {
    p_usuario_id: evaluadoId,
  })

  if (updateError) {
    // Si falla el RPC actualizamos manualmente
    const { data: repData } = await supabase
      .from('reputacion')
      .select('valor')
      .eq('evaluado_id', evaluadoId)

    const total = (repData ?? []).reduce((acc, r) => acc + r.valor, 0)

    await supabase
      .from('usuarios')
      .update({ puntuacion: total })
      .eq('id', evaluadoId)
  }
}

export async function yaCalifique(
  evaluadorId:   string,
  transaccionId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('reputacion')
    .select('id')
    .eq('evaluador_id',   evaluadorId)
    .eq('transaccion_id', transaccionId)
    .single()

  return Boolean(data)
}