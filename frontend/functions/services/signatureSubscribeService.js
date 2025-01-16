/**
 * getSignatureStatuses API https://solana.com/docs/rpc/http/getsignaturestatuses
 * Configuring state commitment https://solana.com/docs/rpc#configuring-state-commitment
 * @param connection
 * @param txId
 */
export async function signatureSubscribe(connection, txId) {
    const delayTime = 3_000; //   3 seconds
    // after 3 minutes we dismiss the transaction and return error
    const delayLimit = 180_000; // 180 seconds = 3 minutes
    let delayCounter = 0;
    while (true) {
        console.log('Fetching signature status...');
        const res = await connection.getSignatureStatuses([txId]);
        const signatureStatus = res.value[0];
        // got response
        if (signatureStatus && (signatureStatus.err
            || signatureStatus.confirmationStatus === 'confirmed'
            || signatureStatus.confirmationStatus === 'finalized')) {
            console.log('Fetching signature status done.');
            return { status: 'ok', txId, ...signatureStatus };
        }
        // didn't get response
        await delay(delayTime);
        delayCounter += delayTime;
        if (delayCounter > delayLimit) {
            console.log('Fetching signature status timed out.');
            return { status: 'error', txId, errorCode: 'SIGNATURE_STATUS_TIMEOUT' };
        }
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
