// src/utils/constantes.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN DE BLOCKCHAIN
// Para migrar a Mainnet solo cambia este archivo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BSC = {
  // TESTNET (desarrollo)
  chainId:    97,
  rpcUrl:     'https://data-seed-prebsc-1-s1.binance.org:8545',
  explorerUrl:'https://testnet.bscscan.com',
  usdt:       '0x337610d27c682E347C9cD60BD4b3b107C9d34dDD',
  nombre:     'BSC Testnet',

  // MAINNET — descomentar para producción
  // chainId:    56,
  // rpcUrl:     'https://bsc-dataseed1.binance.org',
  // explorerUrl:'https://bscscan.com',
  // usdt:       '0x55d398326f99059fF775485246999027B3197955',
  // nombre:     'BSC',
} as const

// ABI mínimo para consultar balance de token ERC-20/BEP-20
export const ERC20_ABI_BALANCE = [
  {
    constant: true,
    inputs:   [{ name: '_owner', type: 'address' }],
    name:     'balanceOf',
    outputs:  [{ name: 'balance', type: 'uint256' }],
    type:     'function',
  },
  {
    constant: true,
    inputs:   [],
    name:     'decimals',
    outputs:  [{ name: '', type: 'uint8' }],
    type:     'function',
  },
] as const

// Límites operacionales
export const LIMITES = {
  diario_default:  100,
  minimo_envio:    0.01,
  maximo_envio:    100,
  decimales_usdt:  18,
  polling_balance: 30_000,  // 30 segundos
} as const