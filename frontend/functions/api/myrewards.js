import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { drizzle } from "drizzle-orm/d1";
import { claimTable, depositTable, projectTable } from "../../shared/drizzle-schema";
import { and, desc, eq } from "drizzle-orm";
import { addMonths } from "date-fns/addMonths";
export const onRequestGet = async (ctx) => {
    const db = drizzle(ctx.env.DB, { logger: true });
    // mock date for testing
    // const currentDate = new Date('2024-12-25')
    const currentDate = new Date();
    try {
        // parse/validate request
        const { searchParams } = new URL(ctx.request.url);
        const address = searchParams.get("address");
        const projectId = searchParams.get("projectId");
        if (!address)
            return jsonResponse({ message: 'address is missing!' }, 400);
        if (!projectId)
            return jsonResponse({ message: 'projectId is missing!' }, 400);
        // load project
        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId))
            .get();
        if (!project)
            return jsonResponse({ message: 'Project not found!' }, 404);
        const cluster = project.json.config.cluster;
        const launchedTokenMintAddress = project.json.config.launchedTokenData.mintAddress;
        if (!launchedTokenMintAddress) {
            throw new Error(`launchedTokenMintAddress not found! projectId=(${projectId})`);
        }
        // load deposits and claims
        const deposits = await db
            .select()
            .from(depositTable)
            .where(and(eq(depositTable.fromAddress, address), eq(depositTable.projectId, projectId)))
            .all();
        if (!deposits.length) {
            return jsonResponse({ hasUserInvested: false }, 200);
        }
        const claims = await db
            .select()
            .from(claimTable)
            .where(and(eq(claimTable.toAddress, address), eq(claimTable.projectId, projectId)))
            .orderBy(desc(claimTable.createdAt))
            .all();
        const claimedAmount = claims.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const launchedTokenDecimals = project.json.config.launchedTokenData.decimals;
        if (!launchedTokenDecimals)
            throw new Error(`launchedTokenDataDecimals missing for project (${projectId})!`);
        const rewardsTotalUiAmount = deposits.reduce((acc, curr) => acc + Number(curr.json.tokensCalculation.rewardDistribution.tokenRaw), 0);
        const rewardsTotalAmount = rewardsTotalUiAmount * Math.pow(10, launchedTokenDecimals);
        const monthsCount = project.json.config.rewardsDistributionTimeInMonths;
        const rewardsDistributionStart = project.json.info.timeline.find(timeline => timeline.id === 'REWARD_DISTRIBUTION')?.date;
        if (!rewardsDistributionStart) {
            return jsonResponse({ message: 'Reward distribution not started!' }, 409);
        }
        const monthsPassedFromRewardsDistributionStart = monthsPassedFrom(rewardsDistributionStart, currentDate);
        const claimablePerMonth = rewardsTotalAmount / monthsCount;
        const claimedMonths = Math.floor(claimedAmount / claimablePerMonth);
        console.log({ claimablePerMonth, rewardsTotalAmount, monthsCount });
        const payoutSchedule = [
            ...Array(monthsCount).keys(),
        ].map((index) => {
            const payoutDate = addMonths(new Date(rewardsDistributionStart), index);
            // TODO @claimsStreamFlowIntegration
            const isClaimed = index < (claimedMonths - 1);
            return {
                amount: String(claimablePerMonth / Math.pow(10, launchedTokenDecimals)),
                isClaimed,
                date: payoutDate,
            };
        });
        const claimableToThisDateAmount = (monthsPassedFromRewardsDistributionStart + 1) * claimablePerMonth;
        const claimableAmount = Math.max(claimableToThisDateAmount - claimedAmount, 0);
        // console.log({ monthsPassedFromRewardsDistributionStart, claimablePerMonth, claimableToThisDateAmount, claimedAmount })
        const hasUserClaimedTotalAmount = claimedAmount >= rewardsTotalAmount;
        const hasUserClaimedAvailableAmount = claimedAmount >= claimableAmount;
        const hasRewardsDistributionStarted = rewardsDistributionStart && (currentDate > new Date(rewardsDistributionStart));
        const raisedTokenDecimals = project.json.config.raisedTokenData.decimals;
        const lpRaisedTokenTotalUiAmount = deposits.reduce((acc, curr) => acc + Number(curr.json.tokensCalculation.lpPosition.borgRaw), 0);
        const lpRaisedTokenTotalUnitAmount = lpRaisedTokenTotalUiAmount * Math.pow(10, raisedTokenDecimals);
        const lpLaunchedTokenTotalUiAmount = deposits.reduce((acc, curr) => acc + Number(curr.json.tokensCalculation.lpPosition.tokenRaw), 0);
        const lpLaunchedTokenTotalUnitAmount = lpLaunchedTokenTotalUiAmount * Math.pow(10, launchedTokenDecimals);
        const result = {
            hasUserInvested: true,
            lpPosition: {
                // borg
                raisedTokenAmount: {
                    amount: lpRaisedTokenTotalUnitAmount,
                    decimals: raisedTokenDecimals,
                    uiAmount: lpRaisedTokenTotalUiAmount,
                },
                // borgy/moemate/solana-id
                launchedTokenAmount: {
                    amount: lpLaunchedTokenTotalUnitAmount,
                    decimals: launchedTokenDecimals,
                    uiAmount: lpLaunchedTokenTotalUiAmount,
                }
            },
            rewards: {
                hasUserClaimedTotalAmount,
                hasUserClaimedAvailableAmount,
                hasRewardsDistributionStarted,
                totalAmount: {
                    amount: rewardsTotalAmount,
                    decimals: launchedTokenDecimals,
                    uiAmount: rewardsTotalUiAmount,
                },
                claimedAmount: {
                    amount: String(claimedAmount),
                    decimals: launchedTokenDecimals,
                    uiAmount: String(claimedAmount / Math.pow(10, launchedTokenDecimals)),
                },
                claimableAmount: {
                    amount: String(claimableAmount),
                    decimals: launchedTokenDecimals,
                    uiAmount: String(claimableAmount / Math.pow(10, launchedTokenDecimals)),
                },
                payoutSchedule,
            }
        };
        return jsonResponse(result, {
            headers: {
                "Cache-Control": "no-cache",
            }
        });
    }
    catch (e) {
        await reportError(ctx.env.DB, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
function monthsPassedFrom(date, currentDate) {
    const now = currentDate ?? new Date();
    date = new Date(date);
    const yearsDifference = now.getFullYear() - date.getFullYear();
    const monthsDifference = now.getMonth() - date.getMonth();
    return yearsDifference * 12 + monthsDifference;
}
