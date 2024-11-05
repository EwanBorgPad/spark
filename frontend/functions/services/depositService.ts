type UpdateUserDepositAmountArgs = {
    db: D1Database,
    amount: number,
    walletAddress: string,
    projectId: string
}

type GetUsersDepositedAmountArgs = {
    db: D1Database,
    walletAddress: string,
    projectId: string
}

const updateUserDepositAmount = async ({ db, amount, projectId, walletAddress }: UpdateUserDepositAmountArgs) => {
    await db
    .prepare("UPDATE whitelist SET amount_deposited = amount_deposited + ?1 WHERE address = ?2 AND project_id = ?3 ;")
    .bind(amount, walletAddress, projectId)
    .run()
}

const getUsersDepositedAmount = async ({ db, projectId, walletAddress }: GetUsersDepositedAmountArgs): Promise<any> => {
    const depositedAmount = await db
    .prepare("SELECT amount_deposited FROM whitelist WHERE address = ?1 AND project_id = ?2 ;")
    .bind(walletAddress, projectId)
    .first()

    return depositedAmount
}


export const DepositService = {
    updateUserDepositAmount,
    getUsersDepositedAmount
}