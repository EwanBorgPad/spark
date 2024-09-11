import { Commitment } from "./SolanaWeb3.ts"

export const USDC_DEV_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"

// prodUrl https://api.mainnet-beta.solana.com/
export const SOLANA_RPC_URL = "https://api.devnet.solana.com"
/**
 * Sticking to 'finalized' commitment level for now.
 * 'finalized' is the safest option, but may take some time to finish transactions.
 * If performance becomes an issue, we can discuss switching to 'confirmed' commitment level.
 */
export const COMMITMENT_LEVEL = "finalized" satisfies Commitment
