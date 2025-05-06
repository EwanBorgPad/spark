// Types for Referral components

/**
 * Type definition for project data in the context of referrals
 */
export interface ProjectDataTypeForReferral {
  info: {
    logoUrl?: string;
    timeline?: Array<{
      id: string;
      date: Date | null;
      label?: string;
      fallbackText?: string;
    }>;
  };
  config: {
    launchedTokenData: {
      ticker: string;
    };
    referralDistribution?: {
      ranking: Record<string, number>;
      raffle: Record<string, number>;
      totalAmountDistributed?: number;
    };
  };
}

/**
 * Type for referral table data
 */
export interface ReferralData {
  referrer_by: string;
  address: string;
  invested_dollar_value: number;
  referrer_address?: string;
  recruited_address?: string;
  amount?: number;
  date?: string;
}

/**
 * Type for leaderboard data
 */
export interface LeaderboardData {
  referrer_by: string;
  total_recruited: number;
  total_investment: number;
  total_tickets: number;
  total_invested: number;
}

/**
 * Type for total tickets distributed
 */
export interface TotalTicketsDistributed {
  referrer_by: string;
  total_invested: number;
  referrer_address?: string;
}

/**
 * Type for user prize data
 */
export interface UserPrize {
  value: string;
  isRaffle: boolean;
} 