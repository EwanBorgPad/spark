import { COMMITMENT_LEVEL } from "./constants";
/**
 * Returns SPL token balance for address at tokenAddress.
 * Returns null if balance is not found.
 * @param address
 * @param tokenAddress
 * @param rpcUrl
 */
export async function getSplTokenBalance({ address, tokenAddress, rpcUrl, }) {
    // TODO add error handling/reporting here
    const getTokenAccountsByOwnerResponse = await fetch(rpcUrl, {
        method: "post",
        headers: {
            "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify({
            id: uuidv4(),
            method: "getTokenAccountsByOwner",
            jsonrpc: "2.0",
            params: [
                address,
                {
                    mint: tokenAddress,
                },
                {
                    encoding: "jsonParsed",
                    commitment: COMMITMENT_LEVEL,
                },
            ],
        }),
    });
    const getTokenAccountsByOwner = await getTokenAccountsByOwnerResponse.json();
    if (!getTokenAccountsByOwner.result?.value.length) {
        // console.log({ tokenAccounts: getTokenAccountsByOwner.result })
        return null;
    }
    return getTokenAccountsByOwner.result.value[0].account.data.parsed.info
        .tokenAmount;
}
/**
 * Stolen from https://stackoverflow.com/a/2117523
 */
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
}
