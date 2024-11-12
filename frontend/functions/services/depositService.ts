type UpdateUserDepositAmountArgs = {
    db: D1Database,
    amount: number,
    walletAddress: string,
    projectId: string,
    lbpAddress: string,
    txId: string,
    tokenAddress: string
}

type GetUsersDepositedAmountArgs = {
    db: D1Database,
    walletAddress: string,
    projectId: string
}

const updateUserDepositAmount = async ({ db, amount, projectId, walletAddress, lbpAddress, tokenAddress, txId }: UpdateUserDepositAmountArgs) => {
    // first we check if user exists/if he made any deposits to this LBP
    let user = await db
    .prepare("SELECT 1 FROM deposit WHERE from_address = ?1 AND project_id = ?2;")
    .bind(walletAddress, projectId)
    .first()
    if (!user) {
        // user does not exist with this wallet address and project id combo so we create him
        await db
        .prepare("INSERT INTO deposit (from_address, to_address, amount_deposited, project_id, token_address, transaction_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6);")
        .bind(walletAddress, lbpAddress, amount, projectId, tokenAddress, txId)
        .first()
    } else {
        // user exists, so we update his amount deposited status and last transaction
        await db
        .prepare("UPDATE deposit SET amount_deposited = amount_deposited + ?1, transaction_id = ?2 WHERE from_address = ?3 AND project_id = ?4;")
        .bind(amount, txId, walletAddress, projectId)
        .first()
    }
}

const getUsersDepositedAmount = async ({ db, projectId, walletAddress }: GetUsersDepositedAmountArgs): Promise<any> => {
    const depositedAmount = await db
    .prepare("SELECT amount_deposited FROM deposit WHERE from_address = ?1 AND project_id = ?2 ;")
    .bind(walletAddress, projectId)
    .first()

    return depositedAmount
}


export const DepositService = {
    updateUserDepositAmount,
    getUsersDepositedAmount
}