// src/types/usuario.ts
export interface Usuario {
  id:            string
  auth_id:       string
  username:      string
  nombre:        string | null
  direccion:     string | null
  puntuacion:    number
  limite_diario: number
  creado_en:     string
}

export interface SesionUsuario {
  id:       string
  email:    string
  usuario:  Usuario
}