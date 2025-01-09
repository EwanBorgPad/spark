import { EligibilityService } from "./eligibilityService"
import { TokenAmountModel } from "../../shared/models"
import { exchangeService } from "./exchangeService"
import { projectTable } from "../../shared/drizzle-schema"
import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1/driver"

type CreateUserDepositArgs = {
    db: DrizzleD1Database
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
                borgRaw: number | null
                borgInUSD: string
                token: string
                tokenRaw: number | null
                tokenInUSD: string
            }
        }
        transactionStatus: unknown
    }
}

type GetUsersDepositedAmountArgs = {
    db: DrizzleD1Database,
    walletAddress: string,
    projectId: string,
}

type GetDepositStatus = {
    db: DrizzleD1Database,
    walletAddress: string,
    projectId: string,
    rpcUrl: string,
}

const createUserDeposit = async ({ db, amount, projectId, walletAddress, lbpAddress, tokenAddress, txId, tierId, nftAddress, json }: CreateUserDepositArgs) => {
    const now = new Date(Date.now()).getTime()
    const jsonString = JSON.stringify(json)
    await db.run(sql`INSERT INTO deposit (from_address, to_address, amount_deposited, project_id, token_address, transaction_id, tier_id, nft_address, created_at, json) 
                    VALUES (${walletAddress}, ${lbpAddress}, ${amount}, ${projectId}, ${tokenAddress}, ${txId}, ${tierId}, ${nftAddress}, ${now}, ${jsonString});`)
}

const getUsersDepositedAmount = async ({ db, projectId, walletAddress }: GetUsersDepositedAmountArgs): Promise<number> => {
    const data = await db.run(sql`SELECT amount_deposited FROM deposit WHERE from_address = ${walletAddress} AND project_id = ${projectId};`)
    if (!data.results.length) return 0
    const amountsDeposited = data.results.map(obj => parseInt(obj.amount_deposited))
    const userDepositSum = amountsDeposited.reduce((accumulator, current) => accumulator + current)
    return userDepositSum
}

export type DepositStatus = {
    amountDeposited: TokenAmountModel,
    minAmountAllowed: TokenAmountModel,
    maxAmountAllowed: TokenAmountModel,
    startTime: Date
}

const getDepositStatus = async ({ db, projectId, walletAddress, rpcUrl }: GetDepositStatus): Promise<DepositStatus> => {
    // get sum of users investment
    const usersAccumulatedDeposit = await getUsersDepositedAmount({ db, projectId, walletAddress })
    // get eligibility for the user
    const eligibility = await EligibilityService.getEligibilityStatus({ db, address: walletAddress, projectId, rpcUrl })
    // initialize users min and max cap in USD and check if they exist
    // TODO this fails if user is not eligible which is ok , whole function doesn't make sense if user is not eligible , but we need to handle it better
    const userMaxCap = eligibility.eligibilityTier?.benefits.maxInvestment
    const userMinCap = eligibility.eligibilityTier?.benefits.minInvestment
    if (!userMaxCap) throw new Error(`Misconfigured project (${projectId}), (userMaxCap) field is missing`)
    if (!userMinCap) throw new Error(`Misconfigured project (${projectId}), (userMinCap) field is missing`)
    const userMaxCapInUsd = Number(userMaxCap)
    const userMinCapInUsd = Number(userMinCap)
    // get project
    const project = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.id, projectId))
        .get()
    if (!project) throw new Error(`Project (${projectId}) not found!`)

    // get relevant data from project and decimals
    const raisedTokenCoinGeckoName = project.json.config.raisedTokenData.coinGeckoName
    const decimals = project.json.config.raisedTokenData.decimals

    const exchangeData = await exchangeService.getExchangeData({
        db,
        baseCurrency: raisedTokenCoinGeckoName,
        targetCurrency: 'usd',
    })
    const tokenPriceInUsd = exchangeData.currentPrice

    if (!decimals) throw new Error('Number of decimals is not defined!')
    // Math logic below
    // TODO: remove this later
    /**
     * Math notes:
        AMOUNT_IN_LAMPORT = AMOUNT_IN_TOKEN * POW(10, DECIMALS)
        AMOUNT_IN_USD = AMOUNT_IN_TOKEN * PRICE_IN_USD
        AMOUNT_IN_TOKEN = AMOUNT_IN_LAMPORT * POW(0.1, DECIMALS)
        AMOUNT_IN_TOKEN = AMOUNT_IN_USD / PRICE_IN_USD
        UI_AMOUNT = AMOUNT_IN_TOKEN
     */
    // first we calculate deposited amount
    const uiAmountDepositedAmount = limitDecimals(usersAccumulatedDeposit * Math.pow(0.1, decimals), decimals)
    const amountDepositedInUsd = uiAmountDepositedAmount * tokenPriceInUsd
    const amountDeposited: TokenAmountModel = {
        amount: usersAccumulatedDeposit.toString(),
        amountInUsd: amountDepositedInUsd.toString(),
        decimals,
        tokenPriceInUsd: tokenPriceInUsd.toString(),
        uiAmount: uiAmountDepositedAmount.toString()
    }
    // calculate minimum cap amount (this always stays the same because users deposit do not affect the minimum amount from the project json)
    const uiMinAmount = limitDecimals(userMinCapInUsd / tokenPriceInUsd, decimals)
    const minAmount = uiMinAmount * Math.pow(10, decimals)
    const minAmountAllowed: TokenAmountModel = {
        amount: minAmount.toString(),
        amountInUsd: userMinCapInUsd.toString(),
        decimals,
        tokenPriceInUsd: tokenPriceInUsd.toString(),
        uiAmount: uiMinAmount.toString()
    }
    // calculate maximum cap amount from project json
    const uiMaxAmount = limitDecimals(userMaxCapInUsd / tokenPriceInUsd, decimals)
    const maxAmount = uiMaxAmount * Math.pow(10, decimals)
    // calculate users allowed maximum cap with sum of previous deposits
    const allowedMaxAmount = maxAmount - usersAccumulatedDeposit
    const allowedMaxUiAmount = limitDecimals(allowedMaxAmount * Math.pow(0.1, decimals), decimals)
    const allowedMaxAmountInUsd = allowedMaxUiAmount * tokenPriceInUsd
    const maxAmountAllowed: TokenAmountModel = {
        amount: allowedMaxAmount.toString(),
        amountInUsd: allowedMaxAmountInUsd.toString(),
        decimals,
        tokenPriceInUsd: tokenPriceInUsd.toString(),
        uiAmount: allowedMaxUiAmount.toString()
    }
    // get start time
    const startTime = eligibility.eligibilityTier?.benefits.startDate ?? project.json.info.timeline.find(timeline => timeline.id === 'SALE_OPENS')?.date
    if (!startTime) throw new Error(`Misconfigured project (${projectId}), (startDate) field is missing`)

    return {
        amountDeposited,
        minAmountAllowed,
        maxAmountAllowed,
        startTime
    }
}

const limitDecimals = (num: number, decimals: number): number => {
    return Number(num.toFixed(decimals))
}

export const DepositService = {
    createUserDeposit,
    getUsersDepositedAmount,
    getDepositStatus
}
