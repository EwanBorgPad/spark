
type Cluster = 'devnet' | 'mainnet'

type TokenData = {
  decimals: number
  coinGeckoName: string
}
type TokenDataMap = Record<
  Cluster, Record<string, TokenData>
>
// TODO @harcoded
const TOKEN_DATA_MAP: TokenDataMap = {
  devnet: {
    // usdc https://explorer.solana.com/address/Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr?cluster=devnet
    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr': {
      decimals: 6,
      // TODO @harcoded
      coinGeckoName: 'swissborg',
    }
  },
  mainnet: {
    // borg https://explorer.solana.com/address/3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z
    '3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z': {
      decimals: 9,
      coinGeckoName: 'swissborg',
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
