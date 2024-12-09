import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { ProjectModel, UserModelJson } from "./models"

export const whitelistTable = sqliteTable('whitelist', {
  address: text().notNull(),
  projectId: text('project_id').notNull(),
  tierId: text('tier_id').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.address, table.projectId] }),
  };
})

export const userTable = sqliteTable('user', {
  address: text().primaryKey(),
  json: text({ mode: 'json' }).notNull().$type<UserModelJson>()
})

export const projectTable = sqliteTable('project', {
  id: text().primaryKey(),
  json: text({ mode: 'json' }).notNull().$type<ProjectModel>()
})

export const followerTable = sqliteTable('follower', {
  id: text().primaryKey(),
  json: text({ mode: 'json' }).notNull()
})

export const nftIndexTable = sqliteTable('nft_index', {
  nftAddress: text('nft_address').primaryKey(),
  collectionAddress: text('collection_address'),
  ownerAddress: text('owner_address'),
  quotedAt: text('quoted_at'),
  json: text({ mode: 'json' }).notNull()
})

type DepositJson = {
  cluster: string
  decimals: number
  tokensCalculation: {
    lpPosition: {
      tokenRaw: number
    }
  }
}
export const depositTable = sqliteTable('deposit', {
  transactionId: text('transaction_id').primaryKey(),
  createdAt: text('created_at').notNull().default(() => new Date().toISOString()),
  fromAddress: text('from_address').notNull(),
  toAddress: text('to_address').notNull(),
  tokenAddress: text('token_address').notNull(),
  amountDeposited: text('amount_deposited').notNull(),
  projectId: text('project_id').notNull(),
  tierId: text('tier_id').notNull(),
  nftAddress: text('nft_address').notNull(),
  json: text({ mode: 'json' }).$type<DepositJson>().notNull()
})

export const claimTable = sqliteTable('claim', {
  transactionId: text('transaction_id').primaryKey(),
  createdAt: text('created_at').notNull().default(() => new Date().toISOString()),
  fromAddress: text('from_address').notNull(),
  toAddress: text('to_address').notNull(),
  tokenAddress: text('token_address').notNull(),
  amount: text('amount_deposited').notNull(),
  projectId: text('project_id').notNull(),
  json: text({ mode: 'json' }).$type<{}>().notNull()
})

// const db = drizzle()
// db
//   .select()
//   .from(whitelistTable)
//   .where(eq(whitelistTable.address, ))
