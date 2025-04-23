import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { isApiKeyValid } from "../services/apiKeyService";

type ENV = {
  DB: D1Database
}

// Add this handler for OPTIONS requests
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


// Add type definitions for project configuration
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

// New endpoint to select raffle winners
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    // Validate API key with write permissions
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
      console.log("Received project config:", JSON.stringify(projectConfig, null, 2));
    } catch (error) {
      console.error('JSON parsing error:', error);
      return jsonResponse({ 
        message: "Failed to parse request body as JSON", 
        error: error.message,
        hint: "Make sure you're sending a valid JSON object with referralDistribution" 
      }, 400);
    }
    
    // Extract referralDistribution from the correct location in the object
    // Support both direct and nested structure
    let referralDistribution = projectConfig.referralDistribution;
    
    // If referralDistribution is not at the top level, check inside config
    if (!referralDistribution && projectConfig.config) {
      referralDistribution = projectConfig.config.referralDistribution;
    }

    // Validate required fields
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
    
    // Determine number of raffle winners needed
    const raffleWinnerCount = Object.keys(referralDistribution.raffle).length;
    
    // Get top ranking positions to exclude them from raffle
    const rankingPositions = Object.keys(referralDistribution.ranking || {}).length;
    
    // Get all users who referred others, with their total invested amounts
    // Excluding those who are already in the top ranking positions
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
    
    // Weighted random selection algorithm
    // The higher the investment, the higher chance to win
    const selectRaffleWinners = (eligibleUsers: any[], count: number) => {
      // Clone the array to avoid modifying the original
      const users = [...eligibleUsers];
      const winners = [];
      
      // Calculate total investment across all eligible users
      const totalInvestment = users.reduce((sum, user) => sum + user.total_invested, 0);
      
      // Select winners based on weighted probability
      for (let i = 0; i < count && users.length > 0; i++) {
        // Generate a random point in the total investment
        const randomPoint = Math.random() * totalInvestment;
        
        let currentSum = 0;
        let selectedIndex = -1;
        
        // Find which user this point belongs to based on their investment
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
    
    // Select raffle winners
    const raffleWinners = selectRaffleWinners(eligibleReferrers.results, raffleWinnerCount);
    
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