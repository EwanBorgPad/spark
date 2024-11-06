import { hasAdminAccess, jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { getAssetsByGroup } from "../../shared/solana/getAssetsByGroup"



type ENV = {
  DB: D1Database
  ADMIN_API_KEY_HASH: string
  SOLANA_RPC_URL: string
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB

  try {
    // authorize request
    if (!hasAdminAccess(ctx)) {
      return jsonResponse(null, 401)
    }

    // parse request
    const { searchParams } = new URL(ctx.request.url)
    const collectionAddress = searchParams.get("collectionAddress")

    // validate request
    if (!collectionAddress) return jsonResponse({ message: 'collectionAddress is missing!' }, 400)

    const rpcUrl = getRpcUrlForCluster(ctx.env.SOLANA_RPC_URL, 'mainnet')

    let page = 1
    while (true) {
      console.log(`GetAssetsByGroup, page:${page}`)
      const assets = await getAssetsByGroup({
        collectionAddress,
        rpcUrl,
        limit: 1000,
        page,
      })

      if (assets.length === 0) {
        console.log(`Assets is empty, break.`)
        break
      }

      const batches = splitIntoBatches(assets, 20)

      let batchIndex = 1
      for (const batch of batches) {
        console.log(`GetAssetsByGroup, page:${page}, batch:${batchIndex}`)
        // bulk insert
        const placeholders = []
        const values = []
        let index = 1
        for (const asset of batch) {
          placeholders.push(`($${index}, $${index + 1}, $${index + 2}, $${index + 3})`)
          values.push(asset.address, asset.collectionAddress, asset.ownerAddress, JSON.stringify(asset.rawJson))
          index += 4
        }
        const query = `
          INSERT INTO nft_index (nft_address, collection_address, owner_address, json)
          VALUES ${placeholders.join(', ')}
          ON CONFLICT DO NOTHING;
        `;

        await db.prepare(query).bind(...values).run()

        batchIndex += 1
      }

      page += 1
    }

    return jsonResponse({ message: "Created!" }, 201)
  } catch (e) {
    const db = ctx.env.DB
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

function splitIntoBatches<T>(list: T[], batchSize: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize);
    batches.push(batch);
  }

  return batches;
}

/**
 * Very bad function to fix the day -- adjust the
 * TODO @clusterSeparation(dev/test/main)
 * @param rpcUrl
 * @param cluster
 */
function getRpcUrlForCluster(rpcUrl: string, cluster: 'mainnet' | 'devnet'): string {
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
