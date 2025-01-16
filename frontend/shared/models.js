import { z } from "zod";
import { TierSchema } from "./eligibilityModel";
/**
 * Represents url type
 * Not sure what we wanna validate there ATM, so leave it as string for now.
 */
const urlSchema = () => z.string();
const iconTypeSchema = () => z.enum(["WEB", "LINKED_IN", "X_TWITTER", "MEDIUM", "OUTER_LINK"]);
const externalUrlSchema = () => z.object({
    url: z.string().min(1),
    iconType: iconTypeSchema(),
    label: z.string(),
});
const dateSchema = () => z.coerce.date();
const timelineEventsSchema = () => z.enum([
    "REGISTRATION_OPENS",
    "SALE_OPENS",
    "SALE_CLOSES",
    "REWARD_DISTRIBUTION",
    "DISTRIBUTION_OVER",
]);
const optional = (type) => type.optional().nullable();
const integerSchema = () => z.number().min(0).max(Number.MAX_SAFE_INTEGER).int();
const idSchema = () => z
    .string()
    .min(1)
    .regex(new RegExp(/^[A-Za-z0-9-]+$/), "Only letters, numbers, and dashes are allowed");
export const SolanaAddressSchema = z.string().regex(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
const SolanaClusterSchema = z.enum(['mainnet', 'devnet']);
const TokenDataSchema = z.object({
    iconUrl: urlSchema(),
    ticker: z.string(),
    mintAddress: SolanaAddressSchema.nullable(),
    decimals: integerSchema(),
    fixedTokenPriceInUsd: optional(z.number()),
    coinGeckoName: optional(z.string()),
});
export const projectSchema = z.object({
    id: idSchema(),
    config: z.object({
        cluster: SolanaClusterSchema,
        lpPositionToBeBurned: optional(z.boolean()),
        raiseTargetInUsd: integerSchema(),
        fdv: optional(integerSchema()),
        marketCap: optional(integerSchema()),
        totalTokensForLiquidityPool: integerSchema(),
        totalTokensForRewardDistribution: integerSchema(),
        rewardsDistributionTimeInMonths: integerSchema(),
        finalSnapshotTimestamp: optional(dateSchema()),
        lbpWalletAddress: SolanaAddressSchema.nullable(),
        raisedTokenData: TokenDataSchema,
        launchedTokenData: TokenDataSchema
    }),
    info: z.object({
        /// following 4 fields are typically added AFTER the sale
        // link for claiming rewards (currently doing airdrops with streamflow, but could be anything)
        claimUrl: optional(z.string()),
        tweetUrl: optional(z.string()),
        tokenContractUrl: optional(z.string()),
        poolContractUrl: optional(z.string()),
        ///// project metadata info /////
        title: z.string().min(1),
        subtitle: z.string().min(1),
        logoUrl: urlSchema(),
        thumbnailUrl: optional(urlSchema()),
        origin: z.string().min(1),
        sector: z.string().min(1),
        tokenGenerationEventDate: optional(z.string()),
        chain: z.object({ name: z.string().min(1), iconUrl: urlSchema() }),
        dataRoom: z.object({ backgroundImgUrl: urlSchema(), url: urlSchema() }),
        liquidityPool: z.object({
            name: z.string().min(1),
            iconUrl: urlSchema(),
            lbpType: z.string().min(1),
            lockingPeriod: z.string().min(1),
        }),
        curator: z.object({
            avatarUrl: urlSchema(),
            fullName: z.string().min(1),
            position: z.string().min(1),
            socials: z.array(externalUrlSchema()),
        }),
        projectLinks: z.array(externalUrlSchema()),
        timeline: z.array(z.object({
            id: timelineEventsSchema(),
            date: dateSchema().nullable(),
            label: z.string().min(1),
        })),
        tiers: z.array(TierSchema).min(1),
    }),
});
export const AcceptTermsRequestSchema = z.object({
    publicKey: z.string(),
    message: z.string(),
    signature: z.array(z.number().int()),
});
export const InvestmentIntentRequestSchema = z.object({
    publicKey: z.string(),
    projectId: z.string(),
    amount: z.string(),
    message: z.string(),
    signature: z.array(z.number().int()),
});
export const InvestmentIntentSummarySchema = z.object({
    sum: z.number(),
    avg: z.number(),
    count: z.number(),
});
