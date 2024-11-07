import { RpcResponse } from "./rpcTypes"

type RpcSearchAssetsResponse = {
  total: number
  limit: number
  page: number
  items: {
    id: string
    grouping: {
      group_key: string
      group_value: string
    }[]
    ownership: {
      owner: string
    }
  }[]
}
type RpcSearchAssetsArgs = {
  rpcUrl: string
  ownerAddress: string
  collections: string[]
  limit: number
  page: number
}
/**
 * Docs: https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api/search-assets
 * @param collectionAddress
 * @param rpcUrl
 * @param limit
 * @param page
 */
export async function rpcSearchAssets({ rpcUrl, ownerAddress, collections, limit, page }: RpcSearchAssetsArgs): Promise<RpcSearchAssetsResponse> {
  if (limit < 1 || limit > 1000) {
    throw new Error('Limit must be between 1 and 1000')
  }

  const response = await fetch(rpcUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/json", // Specify the content type
    },
    body: JSON.stringify({
      id: "1",
      method: "searchAssets",
      jsonrpc: "2.0",
      params: {
        ownerAddress,
        collections,
        limit,
        page,
      },
    }),
  })

  const rpcResponse = (await response.json()) as RpcResponse<RpcSearchAssetsResponse>

  if ('error' in rpcResponse) {
    const message = `Error (code=${rpcResponse.error.code}): ${rpcResponse.error.message}`
    throw new Error(message)
  }

  return rpcResponse.result
}

type HasCollectionNftArgs = {
  rpcUrl: string
  ownerAddress: string
  collectionAddress: string
}
export async function isHoldingNftFromCollection({ rpcUrl, ownerAddress, collectionAddress }: HasCollectionNftArgs): Promise<boolean> {
  const response = await rpcSearchAssets({
    rpcUrl,
    ownerAddress,
    collections: [collectionAddress],
    // hardcoding pagination, assuming no one will check for ownership of 1k+ tokens at a time
    limit: 1000,
    page: 1,
  })

  if (response.total === 1000) {
    throw new Error(`SearchAssets Limit exceeded!`)
  }

  const holdsNftFromCollection = response.items.some(nft =>
    nft.ownership.owner === ownerAddress
    && nft.grouping.some(group =>
      group.group_key === 'collection'
      && group.group_value === collectionAddress
      )
  )

  return holdsNftFromCollection
}
