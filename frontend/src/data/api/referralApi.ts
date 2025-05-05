import {
  AcceptTermsRequest,
  AdminAuthFields,
  CreateEmailRequest,
  DepositStatus,
  GetExchangeResponse,
  GetPresignedUrlResponse,
  GetProjectsResponse,
  InvestmentIntentRequest,
  InvestmentIntentSummary,
  MyRewardsResponse,
  ProjectModel,
  projectSchema,
  SaleResultsResponse,
  TokenAmountModel,
} from "../../../shared/models.ts"
import {
  AnalysisSortBy,
  AnalysisSortDirection,
  AnalystRoleEnum,
  analystSchema,
  GetListOfAnalysisResponse,
  NewAnalysisSchemaType,
} from "../../../shared/schemas/analysis-schema.ts"
import { Analyst, Analysis } from "../../../shared/drizzle-schema.ts"
import { EligibilityStatus } from "../../../shared/eligibilityModel.ts"
import { eligibilityStatusCacheBust, investmentIntentSummaryCacheBust } from "@/utils/cache-helper.ts"
import { BP_JWT_TOKEN } from "@/utils/constants.ts"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/api`

// referral
const POST_REFERRAL_CODE = API_BASE_URL + "/referral/code"
const GET_REFERRAL_CODE = API_BASE_URL + "/referral/code"
const GET_LEADERBOARD = API_BASE_URL + "/referral/leaderboard"


const failFastFetch = async (...args: Parameters<typeof fetch>): Promise<void> => {
  const response = await fetch(...args)

  if (response.status === 401) {
    throw new Error("Signature mismatch! Please make sure you are signing the message with the correct wallet address!")
  }

  if (!response.ok) {
    const responseBody = (await response.json()) as { message?: string }
    throw new Error(responseBody?.message || "Something went wrong...")
  }
}

type PostReferralCodeArgs = {
  referralCode: string
  projectId: string
  publicKey: string
  message: string
  signature: number[]
  isLedgerTransaction: boolean
}

const postReferralCode = async (args: PostReferralCodeArgs): Promise<void> => {
  const url = new URL(POST_REFERRAL_CODE, window.location.href)

  await failFastFetch(url, {
    body: JSON.stringify(args),
    method: "post",
  })
}

type GetReferralCodeArgs = {
  address: string,
  projectId: string
}

type LeaderboardReferral = {
  referrer_by: string;
  total_invested: number;
};

type Referral = {
  referrer_by: string;
  address: string;
  invested_dollar_value: number;
};

type TotalTicket = {
  referrer_by: string;
  total_invested: number;
};

type TotalTicketsDistributed = {
  referrer_by: string;
  total_invested: number;
};

const getReferralCode = async ({
  address,
  projectId,
}: GetReferralCodeArgs): Promise<{
  code: string;
  referralsTable: Referral[];
  totalTickets: TotalTicket[];
}> => {
  const url = new URL(GET_REFERRAL_CODE, window.location.href)
  url.searchParams.set("address", address)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

type GetLeaderboardArgs = {
  projectId: string
}

const getLeaderboard = async ({
  projectId,
}: GetLeaderboardArgs): Promise<{
  leaderboardReferrals: LeaderboardReferral[];
  totalTicketsDistributed: TotalTicketsDistributed[];
}> => {
  const url = new URL(GET_LEADERBOARD, window.location.href)
  url.searchParams.set("projectId", projectId)

  const response = await fetch(url)
  const json = await response.json()

  return json
}

export const referralApi = {
  postReferralCode,
  getReferralCode,
  getLeaderboard,
}
