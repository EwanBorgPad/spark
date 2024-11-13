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
    await db
    .prepare("INSERT INTO deposit (from_address, to_address, amount_deposited, project_id, token_address, transaction_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6);")
    .bind(walletAddress, lbpAddress, amount, projectId, tokenAddress, txId)
    .run()
}

const getUsersDepositedAmount = async ({ db, projectId, walletAddress }: GetUsersDepositedAmountArgs): Promise<bigint> => {
    const data = await db
    .prepare("SELECT amount_deposited FROM deposit WHERE from_address = ?1 AND project_id = ?2;")
    .bind(walletAddress, projectId)
    .all<any>()
    if (!data.results.length) return BigInt(0)
    const amountsDeposited = data.results.map(obj => obj.amount_deposited)
    const depositedAmountSum = amountsDeposited.reduce((accumulator, current) => accumulator + current)
    return BigInt(depositedAmountSum)
}


export const DepositService = {
    updateUserDepositAmount,
    getUsersDepositedAmount
}
