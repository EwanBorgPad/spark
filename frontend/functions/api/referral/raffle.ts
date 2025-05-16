import { jsonResponse, reportError } from "../cfPagesFunctionsUtils";
import { isApiKeyValid } from "../../services/apiKeyService";

type ENV = {
  DB: D1Database
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE, HEAD",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

type ReferralDistribution = {
  totalAmountDistributed: number;
  ranking: Record<string, number>;
  raffle: Record<string, number>;
}

type ProjectConfig = {
  referralDistribution?: ReferralDistribution;
  config?: {
    referralDistribution?: ReferralDistribution;
  };
}

type EligibleUser = {
  referrer_by: string;
  total_invested: number;
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
      return jsonResponse({ message: "Unauthorized" }, 401);
    }

    const url = new URL(ctx.request.url)
    const projectId = url.searchParams.get("projectId")
    
    if (!projectId) {
      return jsonResponse({ message: "Project ID is required" }, 400);
    }
    
    // Safely parse JSON with error handling
    let projectConfig: ProjectConfig;
    try {
      const body = await ctx.request.text();
      if (!body || body.trim() === '') {
        return jsonResponse({ message: "Empty request body" }, 400);
      }
      projectConfig = JSON.parse(body) as ProjectConfig;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return jsonResponse({ 
        message: "Failed to parse request body as JSON", 
        error: error.message,
        hint: "Make sure you're sending a valid JSON object with referralDistribution" 
      }, 400);
    }
    
    let referralDistribution = projectConfig.referralDistribution;
    if (!referralDistribution && projectConfig.config) {
      referralDistribution = projectConfig.config.referralDistribution;
    }

    if (!referralDistribution || !referralDistribution.totalAmountDistributed) {
      return jsonResponse({ 
        message: "Invalid project configuration", 
        details: "Missing totalAmountDistributed in referralDistribution",
        receivedConfig: projectConfig
      }, 400);
    }
    
    if (!referralDistribution.raffle) {
      return jsonResponse({ 
        message: "No raffle configuration found",
        details: "Make sure referralDistribution has a raffle property"
      }, 400);
    }
    
    const raffleWinnerCount = Object.keys(referralDistribution.raffle).length;
    const rankingPositions = Object.keys(referralDistribution.ranking || {}).length;
    
    const eligibleReferrers = await db
      .prepare(`
        SELECT referrer_by, SUM(invested_dollar_value) AS total_invested
        FROM referral
        WHERE project_id = ?
        GROUP BY referrer_by
        ORDER BY total_invested DESC
        LIMIT 1000 OFFSET ?
      `)
      .bind(projectId, rankingPositions)
      .all();
    
    if (!eligibleReferrers.results.length) {
      return jsonResponse({ 
        message: "No eligible users for raffle",
        raffleWinners: []
      }, 200);
    }
    
    const selectRaffleWinners = (eligibleUsers: EligibleUser[], count: number) => {
      const users = [...eligibleUsers];
      const winners: EligibleUser[] = [];
      const totalInvestment = users.reduce((sum, user) => sum + user.total_invested, 0);
      
      for (let i = 0; i < count && users.length > 0; i++) {
        const randomPoint = Math.random() * totalInvestment;
        
        let currentSum = 0;
        let selectedIndex = -1;
        
        for (let j = 0; j < users.length; j++) {
          currentSum += users[j].total_invested;
          if (randomPoint <= currentSum) {
            selectedIndex = j;
            break;
          }
        }
        
        // If somehow we didn't select anyone, take the first user
        if (selectedIndex === -1 && users.length > 0) {
          selectedIndex = 0;
        }
        
        // Add the selected user to winners and remove from eligible pool
        if (selectedIndex !== -1) {
          winners.push(users[selectedIndex]);
          users.splice(selectedIndex, 1);
        }
      }
      
      return winners;
    };
    
    const raffleWinners = selectRaffleWinners(eligibleReferrers.results as EligibleUser[], raffleWinnerCount);
    
    // Update result_type for ranking winners (top 3)
    await db.prepare(`
      UPDATE referral 
      SET result_type = 'ranking' 
      WHERE project_id = ? 
      AND referrer_by IN (
        SELECT referrer_by 
        FROM referral 
        WHERE project_id = ? 
        GROUP BY referrer_by 
        ORDER BY SUM(invested_dollar_value) DESC 
        LIMIT ?
      )
    `).bind(projectId, projectId, rankingPositions).run();

    // Update result_type for raffle winners
    const raffleWinnerAddresses = raffleWinners.map(winner => winner.referrer_by);
    if (raffleWinnerAddresses.length > 0) {
      await db.prepare(`
        UPDATE referral 
        SET result_type = 'raffle' 
        WHERE project_id = ? 
        AND referrer_by IN (${raffleWinnerAddresses.map(() => '?').join(',')})
      `).bind(projectId, ...raffleWinnerAddresses).run();
    }

    // Update result_type for losers (those who didn't win ranking or raffle)
    await db.prepare(`
      UPDATE referral 
      SET result_type = 'lost' 
      WHERE project_id = ? 
      AND result_type IS NULL
    `).bind(projectId).run();
    
    return jsonResponse({ 
      message: "Raffle winners selected successfully",
      raffleWinners: raffleWinners,
      raffleWinnerCount: raffleWinnerCount,
      // Include prize amounts for each winner based on the configuration
      raffleWinnerPrizes: Object.values(referralDistribution.raffle)
                          .map((percentage: number) => 
                            referralDistribution.totalAmountDistributed * percentage)
    }, 200);
    
  } catch (e) {
    await reportError(db, e);
    return jsonResponse({ message: "Failed to select raffle winners", error: e.message }, 500);
  }
}