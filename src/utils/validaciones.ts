// src/utils/validaciones.ts
import { z } from 'zod'

export const registroSchema = z.object({
  username: z
    .string()
    .min(3,  'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guión bajo'),
  email: z
    .string()
    .email('Escribe un email válido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres'),
  pin: z
    .string()
    .length(4, 'El PIN debe tener 4 dígitos')
    .regex(/^\d+$/, 'Solo números'),
  pinConfirm: z
    .string()
    .length(4, 'El PIN debe tener 4 dígitos'),
}).refine(
  (data) => data.pin === data.pinConfirm,
  { message: 'Los PINs no coinciden', path: ['pinConfirm'] }
)

export const loginSchema = z.object({
  email: z
    .string()
    .email('Escribe un email válido'),
  password: z
    .string()
    .min(1, 'Escribe tu contraseña'),
})

export const recuperarSchema = z.object({
  email: z
    .string()
    .email('Escribe un email válido'),
})

export type RegistroForm  = z.infer<typeof registroSchema>
export type LoginForm     = z.infer<typeof loginSchema>
export type RecuperarForm = z.infer<typeof recuperarSchema>