import { primaryKey, sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { ProjectModel, UserModelJson } from "./models"
import { AnalystRoleEnum } from "./schemas/analysis-schema"
import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm"
import { z } from "zod"

export const whitelistTable = sqliteTable(
  "whitelist",
  {
    address: text().notNull(),
    projectId: text("project_id").notNull(),
    tierId: text("tier_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.address, table.projectId] }),
    }
  },
)

export const userTable = sqliteTable("user", {
  address: text().primaryKey(),
  json: text({ mode: "json" }).notNull().$type<UserModelJson>(),
})

export const ProjectStatusSchema = z.enum(["pending", "active"])
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const projectTable = sqliteTable("project", {
  id: text().primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull().$type<ProjectStatus>(),
  json: text({ mode: "json" }).notNull().$type<ProjectModel>(),
})

export const followerTable = sqliteTable("follower", {
  id: text().primaryKey(),
  json: text({ mode: "json" }).notNull(),
})

export const nftIndexTable = sqliteTable("nft_index", {
  nftAddress: text("nft_address").primaryKey(),
  collectionAddress: text("collection_address"),
  ownerAddress: text("owner_address"),
  quotedAt: text("quoted_at"),
  json: text({ mode: "json" }).notNull(),
})

type DepositJson = {
  cluster: string
  decimals: number
  tokensCalculation: {
    lpPosition: {
      tokenRaw: number
      borgRaw: number
    }
    rewardDistribution: {
      tokenRaw: number
    }
  }
}
export const depositTable = sqliteTable("deposit", {
  transactionId: text("transaction_id").primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  tokenAddress: text("token_address").notNull(),
  amountDeposited: text("amount_deposited").notNull(),
  projectId: text("project_id").notNull(),
  tierId: text("tier_id").notNull(),
  nftAddress: text("nft_address").notNull(),
  json: text({ mode: "json" }).$type<DepositJson>().notNull(),
})

export const claimTable = sqliteTable("claim", {
  transactionId: text("transaction_id").primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  tokenAddress: text("token_address").notNull(),
  amount: text("amount_deposited").notNull(),
  projectId: text("project_id").notNull(),
  json: text({ mode: "json" }).$type<unknown>().notNull(),
})

export const eligibilityStatusSnapshotTable = sqliteTable(
  "eligibility_status_snapshot",
  {
    address: text().notNull(),
    projectId: text("project_id").notNull(),
    createdAt: text("created_at").notNull(),
    eligibilityStatus: text("eligibility_status", { mode: "json" }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.address, table.projectId] }),
    }
  },
)

export const exchangeTable = sqliteTable(
  "exchange_cache",
  {
    baseCurrency: text("base_currency").notNull(),
    targetCurrency: text("target_currency").notNull(),

    currentPrice: text("current_price").notNull(),
    quotedFrom: text("quoted_from").notNull(),
    quotedAt: text("quoted_at").notNull(),
    isPinned: integer("is_pinned", { mode: "boolean" }).notNull(),
    rawExchangeResponse: text("raw_exchange_response", { mode: "json" }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.baseCurrency, table.targetCurrency] }),
    }
  },
)

export const tokenBalanceTable = sqliteTable(
  "token_balance",
  {
    ownerAddress: text("owner_address").notNull(),
    tokenMintAddress: text("token_mint_address").notNull(),
    quotedAt: text("quoted_at").notNull(),
    uiAmount: text("ui_amount").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.ownerAddress, table.tokenMintAddress] }),
    }
  },
)

// Analyst table
// NOTE: if you change this type, be sure to change Analyst in models.ts
export const analystTable = sqliteTable("analyst", {
  id: text("id").primaryKey(),
  twitterId: text("twitter_id").notNull().unique(),
  twitterUsername: text("twitter_username").notNull(),
  twitterName: text("twitter_name").notNull(),
  twitterAvatar: text("twitter_avatar").notNull(),
})

// Types for analyst table
export type Analyst = InferSelectModel<typeof analystTable>

// analyst_article table
export const analysisTable = sqliteTable("analysis", {
  id: text("id").primaryKey(),
  analystId: text("analyst_id").notNull(),
  twitterId: text("twitter_id").notNull(),
  projectId: text("project_id").notNull(),
  articleUrl: text("article_url").notNull(),
  analystRole: text("analyst_role").$type<AnalystRoleEnum>().notNull(),
})

// Types for analyst_article table
export type Analysis = InferSelectModel<typeof analysisTable>
