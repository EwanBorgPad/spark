
export type Cluster = 'devnet' | 'mainnet'

type TokenData = {
  decimals: number
  coinGeckoName: string
}
type TokenDataMap = Record<
  Cluster, Record<string, TokenData>
>
// TODO @hardcoded
const TOKEN_DATA_MAP: TokenDataMap = {
  devnet: {
    // usdc https://explorer.solana.com/address/Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr?cluster=devnet
    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr': {
      decimals: 6,
      coinGeckoName: 'swissborg',
    }
  },
  mainnet: {
    // borg https://explorer.solana.com/address/3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z
    '3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z': {
      decimals: 9,
      coinGeckoName: 'swissborg',
    },
    // borgy https://explorer.solana.com/address/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX
    'BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX': {
      decimals: 5,
      coinGeckoName: '',
    }
  }
}

type GetTokenDataArgs = {
  cluster: Cluster
  tokenAddress: string
}
export const getTokenData = ({ cluster, tokenAddress }: GetTokenDataArgs): null | TokenData => {
  return TOKEN_DATA_MAP[cluster]?.[tokenAddress] ?? null
}
