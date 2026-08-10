// src/services/supabase/auth.ts
import { supabase } from './client'

export async function registrarUsuario(
  email:    string,
  password: string,
  username: string,
) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('No se pudo crear el usuario')

  const { error: perfilError } = await supabase
    .from('usuarios')
    .insert({
      auth_id:  data.user.id,
      username: username.toLowerCase().trim(),
    })

  if (perfilError) throw new Error(perfilError.message)

  return data.user
}

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw new Error(error.message)
  return data
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function recuperarContrasena(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw new Error(error.message)
}

export async function verificarUsername(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq('username', username.toLowerCase().trim())
    .single()

  return !data
}

export async function obtenerPerfil(authId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) throw new Error(error.message)
  return data
}