
/**
 * Converts any RPC url to provided cluster.
 * TODO @clusterSeparation(dev/test/main)
 * @param rpcUrl
 * @param cluster
 */
export function getRpcUrlForCluster(rpcUrl: string, cluster: 'mainnet' | 'devnet'): string {
  if (cluster === 'mainnet') {
    return rpcUrl
      .replace('devnet', 'mainnet')
      .replace('testnet', 'mainnet')
  } else if (cluster === 'devnet') {
    return rpcUrl
      .replace('mainnet', 'devnet')
      .replace('testnet', 'devnet')
  } else {
    throw new Error(`Unknown cluster=${cluster}!`)
  }
}
