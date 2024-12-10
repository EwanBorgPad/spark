type CreateUserDepositArgs = {
    db: D1Database
    amount: string
    walletAddress: string
    projectId: string
    lbpAddress: string
    txId: string
    tokenAddress: string
    tierId: string
    nftAddress: string
    json: {
        cluster: string
        uiAmount: string
        decimalMultiplier: string
        tokensCalculation: {
            lpPosition: {
                // TODO rename raisedToken launchedToken
                // TODO align USD/Usd capitalizations
                borg: string
                borgRaw: string
                borgInUSD: string
                token: string
                tokenRaw: string
                tokenInUSD: string
            }
        }
    }
}

type GetUsersDepositedAmountArgs = {
    db: D1Database,
    walletAddress: string,
    projectId: string
}

type GetProjectsDepositedAmountArgs = {
    db: D1Database,
    projectId: string
}

const createUserDeposit = async ({ db, amount, projectId, walletAddress, lbpAddress, tokenAddress, txId, tierId, nftAddress, json }: CreateUserDepositArgs) => {
    const now = new Date(Date.now()).getTime()
    const jsonString = JSON.stringify(json)
    await db
    .prepare("INSERT INTO deposit (from_address, to_address, amount_deposited, project_id, token_address, transaction_id, tier_id, nft_address, created_at, json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);")
    .bind(walletAddress, lbpAddress, amount, projectId, tokenAddress, txId, tierId, nftAddress, now, jsonString)
    .run()
}

const getUsersDepositedAmount = async ({ db, projectId, walletAddress }: GetUsersDepositedAmountArgs): Promise<bigint> => {
    const data = await db
    .prepare("SELECT amount_deposited FROM deposit WHERE from_address = ?1 AND project_id = ?2;")
    .bind(walletAddress, projectId)
    .all<any>()
    if (!data.results.length) return BigInt(0)
    const amountsDeposited = data.results.map(obj => BigInt(obj.amount_deposited))
    const userDepositSum = amountsDeposited.reduce((accumulator, current) => accumulator + current)
    return BigInt(userDepositSum)
}

const getProjectsDepositedAmount = async ({ db, projectId }: GetProjectsDepositedAmountArgs) => {
    const data = await db
    .prepare("SELECT amount_deposited FROM deposit WHERE project_id = ?1;")
    .bind(projectId)
    .all<any>()
    if (!data.results.length) return BigInt(0)
    const amountsDeposited = data.results.map(obj => BigInt(obj.amount_deposited))
    const projectDepositedSum = amountsDeposited.reduce((accumulator, current) => accumulator + current)
    return BigInt(projectDepositedSum)
}

export const DepositService = {
    createUserDeposit,
    getUsersDepositedAmount,
    getProjectsDepositedAmount
}
