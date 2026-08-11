// src/services/blockchain/balance.ts
import { BSC } from '@/utils/constantes'

const RPC_URLS = [
  'https://bsc-testnet-rpc.publicnode.com',
  'https://data-seed-prebsc-1-s1.binance.org:8545',
  'https://data-seed-prebsc-2-s1.binance.org:8545',
]

function encodeBalanceOf(direccion: string): string {
  const addr = direccion.slice(2).toLowerCase().padStart(64, '0')
  return '0x70a08231' + addr
}

function encodeDecimals(): string {
  return '0x313ce567'
}

async function llamarRPC(
  data:   string,
  to:     string,
  rpcUrl: string,
): Promise<string> {
  const response = await fetch(rpcUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      jsonrpc: '2.0',
      method:  'eth_call',
      params:  [{ to, data }, 'latest'],
      id:      1,
    }),
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const json = await response.json()
  if (json.error) throw new Error(json.error.message)
  if (!json.result || json.result === '0x') throw new Error('Respuesta vacía')
  return json.result
}

async function llamarConFallback(data: string, to: string): Promise<string> {
  let ultimoError = ''

  for (const rpcUrl of RPC_URLS) {
    try {
      return await llamarRPC(data, to, rpcUrl)
    } catch (error: any) {
      ultimoError = error.message
    }
  }

  throw new Error('Sin conexión con la red BSC')
}

export async function obtenerBalanceUSDT(direccion: string): Promise<string> {
  const dataDecimals = encodeDecimals()
  const dataBalance  = encodeBalanceOf(direccion)

  const decimalsHex = await llamarConFallback(dataDecimals, BSC.usdt)
  const decimals    = parseInt(decimalsHex.slice(2), 16)

  const balanceHex = await llamarConFallback(dataBalance, BSC.usdt)
  const balanceBig = BigInt('0x' + balanceHex.slice(2))

  const divisor    = BigInt(10 ** decimals)
  const entero     = balanceBig / divisor
  const decimal    = balanceBig % divisor
  const decimalStr = decimal.toString().padStart(decimals, '0').slice(0, 2)

  return String(entero) + '.' + decimalStr
}