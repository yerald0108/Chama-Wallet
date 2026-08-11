// src/utils/formateo.ts

// Formatear monto USDT con 2 decimales
export function formatearUSDT(valor: string | number): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

// Formatear fecha relativa
export function formatearFechaRelativa(fechaISO: string): string {
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diff  = Math.floor((ahora.getTime() - fecha.getTime()) / 1000)

  if (diff < 60)   return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

// Acortar dirección BSC para mostrar
export function acortarDireccion(direccion: string): string {
  if (!direccion || direccion.length < 10) return direccion
  return direccion.slice(0, 6) + '...' + direccion.slice(-4)
}

// Formatear username
export function formatearUsername(username: string): string {
  return '@' + username.toLowerCase()
}