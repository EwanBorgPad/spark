import { Commitment } from "./SolanaWeb3.ts"

export const USDC_DEV_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
/**
 * Solana public RPC endpoint.
 * Should only be used while testing/developing.
 * Before going to production we should remove this variable and only use SOLANA_RPC_URL that comes from environment
 * Mainnet Url: https://api.mainnet-beta.solana.com/
 * @deprecated
 */
export const SOLANA_PUBLIC_RPC_URL = "https://api.devnet.solana.com"
/**
 * Sticking to 'finalized' commitment level for now.
 * 'finalized' is the safest option, but may take some time to finish transactions.
 * If performance becomes an issue, we can discuss switching to 'confirmed' commitment level.
 */
export const COMMITMENT_LEVEL = "finalized" satisfies Commitment
