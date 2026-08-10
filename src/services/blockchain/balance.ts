// src/services/blockchain/balance.ts
import { createPublicClient, http, parseAbi, formatUnits } from 'viem'
import { bscTestnet } from 'viem/chains'
import { BSC, LIMITES } from '@/utils/constantes'

const client = createPublicClient({
  chain:     bscTestnet,
  transport: http(BSC.rpcUrl),
})

const ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
])

export async function obtenerBalanceUSDT(direccion: string): Promise<string> {
  try {
    const balance = await client.readContract({
      address:      BSC.usdt as `0x${string}`,
      abi:          ABI,
      functionName: 'balanceOf',
      args:         [direccion as `0x${string}`],
    })

    const decimals = await client.readContract({
      address:      BSC.usdt as `0x${string}`,
      abi:          ABI,
      functionName: 'decimals',
    })

    return formatUnits(balance as bigint, decimals as number)
  } catch (error) {
    throw new Error('No se pudo obtener el balance')
  }
}