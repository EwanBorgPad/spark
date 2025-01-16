/**
 * Docs: https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api/search-assets
 * @param collectionAddress
 * @param rpcUrl
 * @param limit
 * @param page
 */
export async function rpcSearchAssets({ rpcUrl, limit, page, ownerAddress, collections, tokenType, }) {
    limit ??= 1000;
    page ??= 1;
    if (limit < 1 || limit > 1000) {
        throw new Error('Limit must be between 1 and 1000');
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
                tokenType,
            },
        }),
    });
    const rpcResponse = (await response.json());
    if ('error' in rpcResponse) {
        const message = `Error (code=${rpcResponse.error.code}): ${rpcResponse.error.message}`;
        throw new Error(message);
    }
    return rpcResponse.result;
}
export async function isHoldingNftFromCollections({ rpcUrl, ownerAddress, collections }) {
    const response = await rpcSearchAssets({
        rpcUrl,
        ownerAddress,
        collections,
        // hardcoding pagination, assuming no one will check for ownership of 1k+ tokens at a time
        limit: 1000,
        page: 1,
    });
    if (response.total === 1000) {
        throw new Error(`SearchAssets Limit exceeded!`);
    }
    const retval = {};
    for (const collection of collections) {
        const holdsNftFromCollection = response.items.some(nft => nft.ownership.owner === ownerAddress
            && nft.grouping.some(group => group.group_key === 'collection'
                && group.group_value === collection));
        retval[collection] = holdsNftFromCollection;
    }
    return retval;
}
export async function getTokenHoldingsMap({ rpcUrl, ownerAddress }) {
    const response = await rpcSearchAssets({
        rpcUrl,
        ownerAddress,
        tokenType: 'fungible',
        // hardcoding pagination, assuming no one will check for ownership of 1k+ tokens at a time
        limit: 1000,
        page: 1,
    });
    const tokens = response.items
        .map(item => ({
        id: item.id,
        amount: item.token_info.balance ?? 0,
        decimals: item.token_info.decimals,
        uiAmount: item.token_info.balance
            ? (item.token_info.balance / (10 ** item.token_info.decimals))
            : 0,
    }));
    return tokens.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
    }, {});
}
